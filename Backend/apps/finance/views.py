import razorpay
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import decimal
from django.conf import settings
from django.utils import timezone
from django.db.models import Sum, Q
from .models import Wallet, WalletTransaction, CODRemittance
from .serializers import WalletSerializer, WalletTransactionSerializer, CODRemittanceSerializer

RAZOR_KEY_ID = settings.RAZOR_KEY_ID
RAZOR_KEY_SECRET = settings.RAZOR_KEY_SECRET

client = razorpay.Client(auth=(RAZOR_KEY_ID, RAZOR_KEY_SECRET))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wallet(request):
    wallet, created = Wallet.objects.get_or_create(user=request.user)
    serializer = WalletSerializer(wallet)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transactions(request):
    wallet, created = Wallet.objects.get_or_create(user=request.user)
    transactions = wallet.transactions.all()
    serializer = WalletTransactionSerializer(transactions, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_razorpay_order(request):
    amount = request.data.get('amount')
    if not amount:
        return Response({'detail': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        amount_int = int(float(amount) * 100) # Razorpay needs amount in paise (1 INR = 100 paise)
        order_data = {
            'amount': amount_int,
            'currency': 'INR',
            'payment_capture': 1 # Auto capture
        }
        order = client.order.create(data=order_data)
        return Response({
            'order_id': order['id'],
            'amount': order['amount'],
            'currency': order['currency'],
            'key': RAZOR_KEY_ID
        })
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    razorpay_payment_id = request.data.get('razorpay_payment_id')
    razorpay_order_id = request.data.get('razorpay_order_id')
    razorpay_signature = request.data.get('razorpay_signature')
    amount = request.data.get('amount') # we need to know how much to add

    if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature, amount]):
        return Response({'detail': 'All payment details and amount are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Verify signature
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        # Throws SignatureVerificationError on failure
        client.utility.verify_payment_signature(params_dict)

        wallet, created = Wallet.objects.get_or_create(user=request.user)
        
        amount_decimal = float(amount)
        opening_balance = wallet.balance
        wallet.balance += max(decimal.Decimal(str(amount_decimal)), decimal.Decimal('0.00')) # ensure it's positive just in case
        closing_balance = wallet.balance
        wallet.save()

        # Create wallet transaction
        WalletTransaction.objects.create(
            wallet=wallet,
            amount=amount_decimal,
            transaction_type='CREDIT',
            opening_balance=opening_balance,
            closing_balance=closing_balance,
            description=f'Wallet deposit via Razorpay (Order: {razorpay_order_id})',
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id
        )

        return Response({'detail': 'Payment verified and wallet credited successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ── COD Remittance Endpoints ─────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_remittances(request):
    """
    GET /api/finance/remittances/
    Returns only DELIVERED COD orders with their remittance status (PENDING or TRANSFERRED).
    Auto-creates missing CODRemittance records for old delivered COD orders.
    """
    from orders.models import Order

    # Find all delivered COD orders
    delivered_cod = Order.objects.filter(
        user=request.user, order_type='COD', status='DELIVERED'
    ).order_by('-updated_at')

    # Auto-create missing CODRemittance records for delivered orders that don't have one
    for order in delivered_cod:
        if not CODRemittance.objects.filter(order=order).exists() and order.cod_amount > 0:
            CODRemittance.objects.create(
                user=request.user,
                order=order,
                cod_amount=order.cod_amount,
                status='PENDING',
                delivered_at=order.updated_at or timezone.now(),
            )

    # Now fetch all remittances
    qs = CODRemittance.objects.filter(user=request.user).select_related('order').order_by('-delivered_at')

    status_filter = request.query_params.get('status')
    if status_filter and status_filter in ('PENDING', 'TRANSFERRED'):
        qs = qs.filter(status=status_filter)

    data = []
    for rem in qs:
        data.append({
            'id': rem.id,
            'tracking_id': rem.order.tracking_id,
            'customer_name': rem.order.customer_name,
            'customer_phone': rem.order.customer_phone,
            'cod_amount': float(rem.cod_amount),
            'status': rem.status,
            'delivered_at': rem.delivered_at,
            'transferred_at': rem.transferred_at,
            'created_at': rem.created_at,
        })

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def remittance_summary(request):
    """
    GET /api/finance/remittances/summary/
    Returns summary stats for the COD remittance dashboard.
    """
    qs = CODRemittance.objects.filter(user=request.user)

    total_remitted = qs.filter(status='TRANSFERRED').aggregate(total=Sum('cod_amount'))['total'] or 0
    total_pending = qs.filter(status='PENDING').aggregate(total=Sum('cod_amount'))['total'] or 0
    total_count = qs.count()
    pending_count = qs.filter(status='PENDING').count()
    transferred_count = qs.filter(status='TRANSFERRED').count()

    # Cash with courier: active COD orders not yet delivered or returned
    from orders.models import Order
    active_cod_qs = Order.objects.filter(
        user=request.user, 
        order_type='COD'
    ).exclude(
        status__in=['DELIVERED', 'RETURN', 'CANCELLED', 'RTO_DELIVERED', 'NDR']
    )
    cash_with_courier = active_cod_qs.aggregate(total=Sum('cod_amount'))['total'] or 0
    active_cod_count = active_cod_qs.count()

    return Response({
        'total_remitted': float(total_remitted),
        'total_pending': float(total_pending),
        'cash_with_courier': float(cash_with_courier),
        'active_cod_count': active_cod_count,
        'total_count': total_count,
        'pending_count': pending_count,
        'transferred_count': transferred_count,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def transfer_remittance(request, pk):
    """
    POST /api/finance/remittances/<pk>/transfer/
    Admin action: Mark a single PENDING remittance as TRANSFERRED.
    Credits the COD amount to user's wallet.
    """
    try:
        remittance = CODRemittance.objects.get(pk=pk, user=request.user)
    except CODRemittance.DoesNotExist:
        return Response({'detail': 'Remittance not found.'}, status=status.HTTP_404_NOT_FOUND)

    if remittance.status == 'TRANSFERRED':
        return Response({'detail': 'Already transferred.'}, status=status.HTTP_400_BAD_REQUEST)

    # Credit COD amount to wallet
    wallet, _ = Wallet.objects.get_or_create(user=request.user)
    opening_balance = wallet.balance
    wallet.balance += remittance.cod_amount
    closing_balance = wallet.balance
    wallet.save(update_fields=['balance'])

    WalletTransaction.objects.create(
        wallet=wallet,
        amount=remittance.cod_amount,
        transaction_type='CREDIT',
        opening_balance=opening_balance,
        closing_balance=closing_balance,
        description=f'COD Remittance for Order {remittance.order.tracking_id}',
    )

    remittance.status = 'TRANSFERRED'
    remittance.transferred_at = timezone.now()
    remittance.save(update_fields=['status', 'transferred_at'])

    return Response(CODRemittanceSerializer(remittance).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def transfer_all_remittances(request):
    """
    POST /api/finance/remittances/transfer-all/
    Admin action: Transfer ALL pending remittances at once.
    """
    pending = CODRemittance.objects.filter(user=request.user, status='PENDING')

    if not pending.exists():
        return Response({'detail': 'No pending remittances to transfer.'}, status=status.HTTP_400_BAD_REQUEST)

    wallet, _ = Wallet.objects.get_or_create(user=request.user)
    total_amount = pending.aggregate(total=Sum('cod_amount'))['total'] or 0

    if total_amount <= 0:
        return Response({'detail': 'No amount to transfer.'}, status=status.HTTP_400_BAD_REQUEST)

    opening_balance = wallet.balance
    wallet.balance += total_amount
    closing_balance = wallet.balance
    wallet.save(update_fields=['balance'])

    WalletTransaction.objects.create(
        wallet=wallet,
        amount=total_amount,
        transaction_type='CREDIT',
        opening_balance=opening_balance,
        closing_balance=closing_balance,
        description=f'Bulk COD Remittance ({pending.count()} orders)',
    )

    now = timezone.now()
    pending.update(status='TRANSFERRED', transferred_at=now)

    return Response({
        'detail': f'Successfully transferred ₹{total_amount} from {pending.count()} orders.',
        'amount': float(total_amount),
    })


# ── Invoice Endpoints ────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_invoices(request):
    """
    GET /api/finance/invoices/
    Auto-generates monthly shipping invoices from delivered orders.
    Each invoice covers a calendar month.
    """
    from orders.models import Order
    from django.db.models.functions import TruncMonth, ExtractYear, ExtractMonth
    from django.db.models import Count
    import calendar

    DELIVERY_CHARGE = decimal.Decimal('100.00')
    GST_RATE = decimal.Decimal('0.18')

    # Group delivered orders by month
    monthly_groups = (
        Order.objects.filter(user=request.user, status='DELIVERED')
        .annotate(month=TruncMonth('updated_at'))
        .values('month')
        .annotate(
            order_count=Count('id'),
            total_product_value=Sum('product_amount'),
            total_cod=Sum('cod_amount'),
        )
        .order_by('-month')
    )

    invoices = []
    for i, group in enumerate(monthly_groups):
        month_dt = group['month']
        order_count = group['order_count']
        total_product = float(group['total_product_value'] or 0)
        total_cod = float(group['total_cod'] or 0)

        # Calculate charges
        subtotal = float(DELIVERY_CHARGE * order_count)
        gst = round(subtotal * float(GST_RATE), 2)
        total = round(subtotal + gst, 2)

        # Get individual orders for this month
        month_start = month_dt
        if month_dt.month == 12:
            month_end = month_dt.replace(year=month_dt.year + 1, month=1, day=1)
        else:
            month_end = month_dt.replace(month=month_dt.month + 1, day=1)

        orders_in_month = Order.objects.filter(
            user=request.user,
            status='DELIVERED',
            updated_at__gte=month_start,
            updated_at__lt=month_end,
        ).values('tracking_id', 'customer_name', 'weight', 'order_type', 'cod_amount', 'product_amount', 'updated_at')

        month_name = calendar.month_name[month_dt.month]
        year = month_dt.year
        last_day = calendar.monthrange(year, month_dt.month)[1]

        invoices.append({
            'invoice_number': f'INV-{year}{month_dt.month:02d}-{request.user.id}',
            'period': f'{month_name} {year}',
            'period_label': f'01 {month_name[:3]} {year} — {last_day} {month_name[:3]} {year}',
            'order_count': order_count,
            'total_product_value': total_product,
            'total_cod_collected': total_cod,
            'delivery_charge_per_order': float(DELIVERY_CHARGE),
            'subtotal': subtotal,
            'gst_rate': float(GST_RATE) * 100,
            'gst_amount': gst,
            'total_amount': total,
            'orders': list(orders_in_month),
        })

    return Response(invoices)
