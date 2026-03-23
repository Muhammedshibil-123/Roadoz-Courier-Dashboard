import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class Order(models.Model):
    """Logistics order model for the courier aggregator."""

    class OrderType(models.TextChoices):
        PREPAID = "PREPAID", "Prepaid"
        COD = "COD", "Cash on Delivery"

    class Status(models.TextChoices):
        PROCESSING = "PROCESSING", "Processing"
        MANIFESTED = "MANIFESTED", "Manifested"
        PICKUP_PENDING = "PICKUP_PENDING", "Pickup Pending"
        NOT_PICKED = "NOT_PICKED", "Not Picked"
        IN_TRANSIT = "IN_TRANSIT", "In Transit"
        OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY", "Out for Delivery"
        DELIVERED = "DELIVERED", "Delivered"
        NDR = "NDR", "Non-Delivery Report"
        RTO_IN_TRANSIT = "RTO_IN_TRANSIT", "RTO In Transit"
        RTO_DELIVERED = "RTO_DELIVERED", "RTO Delivered"
        RETURN = "RETURN", "Return"
        CANCELLED = "CANCELLED", "Cancelled"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
    )
    tracking_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        db_index=True,
    )
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=15)
    destination_address = models.TextField()
    destination_pincode = models.CharField(max_length=10)
    weight = models.DecimalField(
        max_digits=8, decimal_places=2, help_text="Weight in kg"
    )
    order_type = models.CharField(
        max_length=10,
        choices=OrderType.choices,
        default=OrderType.PREPAID,
    )
    cod_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="₹0 if prepaid",
    )
    product_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Total product value / selling price",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PROCESSING,
        db_index=True,
    )
    status_changed_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.tracking_id} — {self.customer_name} ({self.get_status_display()})"
        )

    def save(self, *args, **kwargs):
        if not self.tracking_id:
            self.tracking_id = self._generate_tracking_id()
        super().save(*args, **kwargs)

    @staticmethod
    def _generate_tracking_id():
        """Generate a unique tracking ID like RDZ-XXXXXXXXX."""
        uid = uuid.uuid4().hex[:9].upper()
        tid = f"RDZ{uid}"
        while Order.objects.filter(tracking_id=tid).exists():
            uid = uuid.uuid4().hex[:9].upper()
            tid = f"RDZ{uid}"
        return tid
