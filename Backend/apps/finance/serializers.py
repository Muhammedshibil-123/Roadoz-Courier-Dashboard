from rest_framework import serializers

from .models import CODRemittance, Wallet, WalletTransaction


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ["id", "balance"]


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = "__all__"


class CODRemittanceSerializer(serializers.ModelSerializer):
    tracking_id = serializers.CharField(source="order.tracking_id", read_only=True)
    customer_name = serializers.CharField(source="order.customer_name", read_only=True)
    customer_phone = serializers.CharField(
        source="order.customer_phone", read_only=True
    )

    class Meta:
        model = CODRemittance
        fields = [
            "id",
            "tracking_id",
            "customer_name",
            "customer_phone",
            "cod_amount",
            "status",
            "delivered_at",
            "transferred_at",
            "created_at",
        ]
