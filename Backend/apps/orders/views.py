from datetime import timedelta

from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import Order
from .serializers import OrderSerializer, OrderStatusSerializer


class OrderListCreateView(generics.ListCreateAPIView):

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Order.objects.select_related("user").filter(user=self.request.user)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        import decimal

        from finance.models import Wallet, WalletTransaction

        order = serializer.save(user=self.request.user)


        if (
            order.order_type == Order.OrderType.PREPAID
            and getattr(order, "product_amount", 0) > 0
        ):
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
        return Order.objects.select_related("user").filter(user=self.request.user)


SELLER_TRANSITIONS = {
    "PROCESSING": "MANIFESTED",
    "MANIFESTED": "PICKUP_PENDING",
    "PICKUP_PENDING": "IN_TRANSIT",
}


import decimal

from django.db.models import Count


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def advance_order(request, pk):
    try:
        order = Order.objects.get(pk=pk, user=request.user)
    except Order.DoesNotExist:
        return Response(
            {"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND
        )

    next_status = SELLER_TRANSITIONS.get(order.status)
    if not next_status:
        return Response(
            {
                "detail": f"Cannot advance from {order.status}. Use admin-control for further changes."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if order.status == "PICKUP_PENDING" and next_status == "IN_TRANSIT":
        from finance.models import Wallet, WalletTransaction

        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        delivery_charge = decimal.Decimal("100.00")

        if wallet.balance < delivery_charge:
            return Response(
                {
                    "detail": "Insufficient wallet balance. Please add at least ₹100 to your wallet as delivery charge."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        opening_balance = wallet.balance
        wallet.balance -= delivery_charge
        closing_balance = wallet.balance
        wallet.save(update_fields=["balance"])


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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def check_not_picked(request):

    cutoff = timezone.now() - timedelta(hours=24)
    updated = Order.objects.filter(
        user=request.user,
        status="PICKUP_PENDING",
        status_changed_at__lte=cutoff,
    ).update(status="NOT_PICKED", status_changed_at=timezone.now())

    return Response({"updated": updated})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):

    try:
        order = Order.objects.get(pk=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response(
            {"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND
        )

    serializer = OrderStatusSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    new_status = serializer.validated_data["status"]

    import decimal

    from finance.models import Wallet, WalletTransaction

    wallet, _ = Wallet.objects.get_or_create(user=request.user)

    if (
        new_status == "DELIVERED"
        and order.order_type == "COD"
        and order.status != "DELIVERED"
    ):
        desc = f"COD Delivered Revenue for Order {order.tracking_id}"
        if not WalletTransaction.objects.filter(
            wallet=wallet, description=desc, transaction_type="CREDIT"
        ).exists():
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

        from finance.models import CODRemittance

        if (
            order.cod_amount > 0
            and not CODRemittance.objects.filter(order=order).exists()
        ):
            CODRemittance.objects.create(
                user=request.user,
                order=order,
                cod_amount=order.cod_amount,
                status="PENDING",
                delivered_at=timezone.now(),
            )

    if new_status in ["RETURN", "CANCELLED", "RTO_DELIVERED"] and order.status not in [
        "RETURN",
        "CANCELLED",
        "RTO_DELIVERED",
    ]:
        desc = f"Product Revenue Reversal for Return Order {order.tracking_id}"
        if not WalletTransaction.objects.filter(
            wallet=wallet, description=desc, transaction_type="DEBIT"
        ).exists():
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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_stats(request):

    qs = Order.objects.filter(user=request.user)

    counts = qs.values("status").annotate(count=Count("status"))

    stats = {choice_value: 0 for choice_value, _ in Order.Status.choices}

    total = 0
    for entry in counts:
        stats[entry["status"]] = entry["count"]
        total += entry["count"]

    stats["TOTAL"] = total
    return Response(stats)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_overview(request):

    from django.db.models import F, Sum
    from django.db.models.functions import TruncMonth
    from finance.models import CODRemittance, Wallet, WalletTransaction

    user = request.user
    qs = Order.objects.filter(user=user)

    counts = qs.values("status").annotate(count=Count("status"))
    order_stats = {choice_value: 0 for choice_value, _ in Order.Status.choices}
    total = 0
    for entry in counts:
        order_stats[entry["status"]] = entry["count"]
        total += entry["count"]
    order_stats["TOTAL"] = total

    rto_total = order_stats.get("RTO_IN_TRANSIT", 0) + order_stats.get(
        "RTO_DELIVERED", 0
    )
    pending_total = (
        order_stats.get("PICKUP_PENDING", 0)
        + order_stats.get("PROCESSING", 0)
        + order_stats.get("MANIFESTED", 0)
    )

    wallet, _ = Wallet.objects.get_or_create(user=user)
    recent_txns = WalletTransaction.objects.filter(wallet=wallet)[:5]
    txn_data = [
        {
            "amount": float(t.amount),
            "type": t.transaction_type,
            "description": t.description,
            "date": t.created_at,
            "closing_balance": float(t.closing_balance),
        }
        for t in recent_txns
    ]

    credit_total = float(
        WalletTransaction.objects.filter(
            wallet=wallet, transaction_type="CREDIT"
        ).aggregate(total=Sum("amount"))["total"]
        or 0
    )
    debit_total = float(
        WalletTransaction.objects.filter(
            wallet=wallet, transaction_type="DEBIT"
        ).aggregate(total=Sum("amount"))["total"]
        or 0
    )

    cod_pending = float(
        CODRemittance.objects.filter(user=user, status="PENDING").aggregate(
            total=Sum("cod_amount")
        )["total"]
        or 0
    )
    cod_transferred = float(
        CODRemittance.objects.filter(user=user, status="TRANSFERRED").aggregate(
            total=Sum("cod_amount")
        )["total"]
        or 0
    )
    active_cod = qs.filter(order_type="COD").exclude(
        status__in=["DELIVERED", "RETURN", "CANCELLED", "RTO_DELIVERED", "NDR"]
    )
    cash_with_courier = float(
        active_cod.aggregate(total=Sum("cod_amount"))["total"] or 0
    )

    cod_count = qs.filter(order_type="COD").count()
    prepaid_count = qs.filter(order_type="PREPAID").count()

    monthly = (
        qs.annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("-month")[:6]
    )
    monthly_trend = [
        {
            "month": m["month"].strftime("%b %Y") if m["month"] else "",
            "count": m["count"],
        }
        for m in monthly
    ]

    return Response(
        {
            "order_stats": order_stats,
            "summary": {
                "total": total,
                "delivered": order_stats.get("DELIVERED", 0),
                "rto": rto_total,
                "pending": pending_total,
                "in_transit": order_stats.get("IN_TRANSIT", 0),
                "ndr": order_stats.get("NDR", 0),
            },
            "wallet": {
                "balance": float(wallet.balance),
                "total_credited": credit_total,
                "total_debited": debit_total,
                "recent_transactions": txn_data,
            },
            "cod": {
                "pending": cod_pending,
                "transferred": cod_transferred,
                "cash_with_courier": cash_with_courier,
            },
            "order_type_breakdown": {
                "cod": cod_count,
                "prepaid": prepaid_count,
            },
            "monthly_trend": monthly_trend,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def consignees_list(request):

    from django.db.models import Max


    consignees = (
        Order.objects.filter(user=request.user)
        .values(
            "customer_name",
            "customer_phone",
            "destination_address",
            "destination_pincode",
        )
        .annotate(latest_order=Max("created_at"))
        .order_by("-latest_order")
    )

    results = []

    seen_phones = set()
    for c in consignees:
        phone = c["customer_phone"]
        if phone not in seen_phones:
            seen_phones.add(phone)


            address_parts = [p.strip() for p in c["destination_address"].split(",")]
            state = address_parts[-1] if len(address_parts) > 0 else "Unknown"
            city = address_parts[-2] if len(address_parts) > 1 else "Unknown"
            short_address = (
                ", ".join(address_parts[:-2])
                if len(address_parts) > 2
                else c["destination_address"]
            )
            status = True
            results.append(
                {
                    "id": c["id__min"],
                    "name": c["customer_name"],
                    "phone": c["customer_phone"],
                    "email": "N/A",  
                    "address": short_address,
                    "city": city,
                    "state": state,
                    "pincode": c["destination_pincode"],
                    "status": True,  
                }
            )

    return Response(results)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def bulk_delete_orders(request):

    ids = request.data.get("ids", [])
    if not ids:
        return Response(
            {"detail": "No order IDs provided."}, status=status.HTTP_400_BAD_REQUEST
        )

    qs = Order.objects.filter(user=request.user, id__in=ids, status="PROCESSING")
    deleted_count = qs.count()
    qs.delete()

    return Response(
        {
            "deleted": deleted_count,
            "detail": f"{deleted_count} order(s) deleted successfully.",
        }
    )


import csv
from datetime import datetime

from django.http import HttpResponse


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_orders_csv(request):

    fields_param = request.query_params.get("fields", "")
    requested_fields = (
        [f.strip() for f in fields_param.split(",")] if fields_param else []
    )

    start_date = request.query_params.get("start_date")
    end_date = request.query_params.get("end_date")
    export_format = request.query_params.get("export_format", "csv").lower()

    qs = Order.objects.filter(user=request.user)

    if start_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            if timezone.is_aware(timezone.now()):
                start_dt = timezone.make_aware(start_dt)
            qs = qs.filter(created_at__gte=start_dt)
        except ValueError:
            pass
    if end_date:
        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
            if timezone.is_aware(timezone.now()):
                end_dt = timezone.make_aware(end_dt)
            qs = qs.filter(created_at__lte=end_dt + timedelta(days=1))
        except ValueError:
            pass


    def safe_float(val):
        try:
            if val is None or val == "":
                return 0.0
            return float(val)
        except (ValueError, TypeError):
            return 0.0

    FIELD_MAP = {
        "Tracking ID": lambda o: str(o.tracking_id or ""),
        "Buyer Name": lambda o: str(o.customer_name or ""),
        "Buyer Mobile": lambda o: str(o.customer_phone or ""),
        "Address": lambda o: str(o.destination_address or ""),
        "PinCode": lambda o: str(o.destination_pincode or ""),
        "Order Status": lambda o: str(o.get_status_display()) if o.status else "",
        "Order Date": lambda o: (
            o.created_at.strftime("%Y-%m-%d %H:%M") if o.created_at else ""
        ),
        "Weight (kg)": lambda o: safe_float(o.weight),
        "Type": lambda o: str(o.get_order_type_display()) if o.order_type else "",
        "COD Amount": lambda o: (
            safe_float(o.cod_amount) if o.order_type == "COD" else 0.0
        ),
        "Product Value": lambda o: safe_float(o.product_amount),
        "Last Updated": lambda o: (
            o.status_changed_at.strftime("%Y-%m-%d %H:%M")
            if o.status_changed_at
            else ""
        ),
    }

    if not requested_fields or requested_fields == [""]:
        header = list(FIELD_MAP.keys())
    else:

        header = [f for f in requested_fields if f in FIELD_MAP]

    if not header:
        header = ["Tracking ID", "Order Status", "Order Date"]

    if export_format == "json":
        data = []
        try:
            for order in qs.iterator():
                row = {}
                for col in header:
                    row[col] = FIELD_MAP[col](order)
                data.append(row)
            return Response({"header": header, "data": data})
        except Exception as e:
            return Response({"detail": f"Error generating JSON: {str(e)}"}, status=500)


    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="roadoz_orders_report.csv"'

    writer = csv.writer(response)
    writer.writerow(header)

    try:
        for order in qs.iterator():
            row = []
            for col in header:
                try:
                    row.append(FIELD_MAP[col](order))
                except Exception as cell_err:
                    row.append(f"ERR: {str(cell_err)}")
            writer.writerow(row)
    except Exception as e:
        writer.writerow(["ERROR_GENERATING", str(e)])

    return response
