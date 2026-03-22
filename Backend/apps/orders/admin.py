from django.contrib import admin
from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "tracking_id",
        "customer_name",
        "status",
        "order_type",
        "cod_amount",
        "destination_pincode",
        "user",
        "created_at",
    )
    list_filter = ("status", "order_type", "created_at", "user")
    search_fields = ("tracking_id", "customer_name", "customer_phone", "destination_pincode")
    readonly_fields = ("tracking_id", "created_at", "updated_at")
    list_per_page = 25
    date_hierarchy = "created_at"
