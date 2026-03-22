from datetime import timedelta

from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import Order
from .serializers import OrderSerializer, OrderStatusSerializer


# ── Seller endpoints ─────────────────────────────────────────────────────────

class OrderListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/orders/           → list seller's orders (?status=PROCESSING etc.)
    POST /api/orders/           → create a new order (defaults to PROCESSING)
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Order.objects.select_related('user').filter(user=self.request.user)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        from finance.models import Wallet, WalletTransaction
        import decimal

        order = serializer.save(user=self.request.user)
        
        # 1. PREPAID Order Creation (CREDIT Product Revenue)
        if order.order_type == Order.OrderType.PREPAID and getattr(order, 'product_amount', 0) > 0:
            wallet, _ = Wallet.objects.get_or_create(user=self.request.user)
            amount_to_credit = order.product_amount
            
            opening_balance = wallet.balance
            wallet.balance += amount_to_credit
            closing_balance = wallet.balance
            wallet.save(update_fields=["balance"])
            
            WalletTransaction.objects.create(
                wallet=wallet,
                amount=amount_to_credit,
                transaction_type="CREDIT",
                opening_balance=opening_balance,
                closing_balance=closing_balance,
                description=f"Prepaid Product Revenue for Order {order.tracking_id}",
            )


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.select_related('user').filter(user=self.request.user)


# ── Seller workflow: tick to advance status ───────────────────────────────────

SELLER_TRANSITIONS = {
    "PROCESSING": "MANIFESTED",
    "MANIFESTED": "PICKUP_PENDING",
    "PICKUP_PENDING": "IN_TRANSIT",
}


from django.db.models import Count
import decimal

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def advance_order(request, pk):
    """
    PATCH /api/orders/<pk>/advance/
    Seller ticks an order → it moves to the next status in the workflow.
    PROCESSING → MANIFESTED → PICKUP_PENDING → IN_TRANSIT
    """
    try:
        order = Order.objects.get(pk=pk, user=request.user)
    except Order.DoesNotExist:
        return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

    next_status = SELLER_TRANSITIONS.get(order.status)
    if not next_status:
        return Response(
            {"detail": f"Cannot advance from {order.status}. Use admin-control for further changes."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # If advancing to IN_TRANSIT (package is picked up), deduct ₹100 from Wallet
    if order.status == "PICKUP_PENDING" and next_status == "IN_TRANSIT":
        from finance.models import Wallet, WalletTransaction
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        delivery_charge = decimal.Decimal("100.00")
        
        if wallet.balance < delivery_charge:
            return Response(
                {"detail": "Insufficient wallet balance. Please add at least ₹100 to your wallet as delivery charge."},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        opening_balance = wallet.balance
        wallet.balance -= delivery_charge
        closing_balance = wallet.balance
        wallet.save(update_fields=["balance"])

        # Create Debit Transaction
        WalletTransaction.objects.create(
            wallet=wallet,
            amount=delivery_charge,
            transaction_type="DEBIT",
            opening_balance=opening_balance,
            closing_balance=closing_balance,
            description=f"Delivery charge for order {order.tracking_id}",
        )

    order.status = next_status
    order.status_changed_at = timezone.now()
    order.save(update_fields=["status", "status_changed_at", "updated_at"])

    return Response(OrderSerializer(order).data)


# ── Auto-check PICKUP_PENDING orders (24h → NOT_PICKED) ─────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def check_not_picked(request):
    """
    POST /api/orders/check-not-picked/
    Any PICKUP_PENDING order older than 24h is auto-changed to NOT_PICKED.
    Called by the Pending page on load.
    """
    cutoff = timezone.now() - timedelta(hours=24)
    updated = Order.objects.filter(
        user=request.user,
        status="PICKUP_PENDING",
        status_changed_at__lte=cutoff,
    ).update(status="NOT_PICKED", status_changed_at=timezone.now())

    return Response({"updated": updated})


# ── Admin / Courier-boy status update  ───────────────────────────────────────

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):
    """
    PATCH /api/orders/<order_id>/status/
    Body: { "status": "OUT_FOR_DELIVERY" }
    Updates order status (used by admin-control page).
    """
    try:
        order = Order.objects.get(pk=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = OrderStatusSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    new_status = serializer.validated_data["status"]
    
    from finance.models import Wallet, WalletTransaction
    import decimal
    wallet, _ = Wallet.objects.get_or_create(user=request.user)

    # 3. COD Order Delivered (CREDIT Product Revenue)
    if new_status == "DELIVERED" and order.order_type == "COD" and order.status != "DELIVERED":
        desc = f"COD Delivered Revenue for Order {order.tracking_id}"
        # Ensure idempotent (no double credits)
        if not WalletTransaction.objects.filter(wallet=wallet, description=desc, transaction_type="CREDIT").exists():
            amount_to_credit = order.product_amount
            if amount_to_credit > 0:
                opening_balance = wallet.balance
                wallet.balance += amount_to_credit
                closing_balance = wallet.balance
                wallet.save(update_fields=["balance"])
                
                WalletTransaction.objects.create(
                    wallet=wallet,
                    amount=amount_to_credit,
                    transaction_type="CREDIT",
                    opening_balance=opening_balance,
                    closing_balance=closing_balance,
                    description=desc,
                )

    # 4. Return/Cancelled Orders (DEBIT/Reverse Product Revenue)
    if new_status in ["RETURN", "CANCELLED", "RTO_DELIVERED"] and order.status not in ["RETURN", "CANCELLED", "RTO_DELIVERED"]:
        desc = f"Product Revenue Reversal for Return Order {order.tracking_id}"
        # Ensure idempotent
        if not WalletTransaction.objects.filter(wallet=wallet, description=desc, transaction_type="DEBIT").exists():
            amount_to_reverse = order.product_amount
            if amount_to_reverse > 0:
                opening_balance = wallet.balance
                wallet.balance -= amount_to_reverse
                closing_balance = wallet.balance
                wallet.save(update_fields=["balance"])
                
                WalletTransaction.objects.create(
                    wallet=wallet,
                    amount=amount_to_reverse,
                    transaction_type="DEBIT",
                    opening_balance=opening_balance,
                    closing_balance=closing_balance,
                    description=desc,
                )

    order.status = new_status
    order.status_changed_at = timezone.now()
    order.save(update_fields=["status", "status_changed_at", "updated_at"])

    return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


# ── Dashboard stats ──────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_stats(request):
    """
    N+1 Query Issue Fixed: Use .values().annotate() to get all counts in a single query
    instead of calling .count() for every single status.
    """
    qs = Order.objects.filter(user=request.user)
    
    # Run a single query with GROUP BY status
    counts = qs.values('status').annotate(count=Count('status'))
    
    # Initialize all stats to 0
    stats = {choice_value: 0 for choice_value, _ in Order.Status.choices}
    
    total = 0
    for entry in counts:
        stats[entry['status']] = entry['count']
        total += entry['count']
        
    stats["TOTAL"] = total
    return Response(stats)
