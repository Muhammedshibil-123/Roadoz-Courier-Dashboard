from rest_framework import serializers
from .models import Order


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "id",
            "tracking_id",
            "customer_name",
            "customer_phone",
            "destination_address",
            "destination_pincode",
            "weight",
            "order_type",
            "cod_amount",
            "status",
            "status_changed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tracking_id", "status", "status_changed_at", "created_at", "updated_at"]


class OrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)
