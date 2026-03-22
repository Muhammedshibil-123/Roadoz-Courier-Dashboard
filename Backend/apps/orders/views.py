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
        qs = Order.objects.filter(user=self.request.user)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


# ── Seller workflow: tick to advance status ───────────────────────────────────

SELLER_TRANSITIONS = {
    "PROCESSING": "MANIFESTED",
    "MANIFESTED": "PICKUP_PENDING",
    "PICKUP_PENDING": "IN_TRANSIT",
}


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

    order.status = serializer.validated_data["status"]
    order.status_changed_at = timezone.now()
    order.save(update_fields=["status", "status_changed_at", "updated_at"])

    return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


# ── Dashboard stats ──────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_stats(request):
    qs = Order.objects.filter(user=request.user)
    stats = {}
    for choice_value, choice_label in Order.Status.choices:
        stats[choice_value] = qs.filter(status=choice_value).count()
    stats["TOTAL"] = qs.count()
    return Response(stats)
