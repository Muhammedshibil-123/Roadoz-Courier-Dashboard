from django.urls import path

from . import views

urlpatterns = [
    path("wallet/", views.get_wallet, name="get_wallet"),
    path("wallet/transactions/", views.get_transactions, name="get_transactions"),
    path(
        "create-razorpay-order/",
        views.create_razorpay_order,
        name="create_razorpay_order",
    ),
    path("verify-payment/", views.verify_payment, name="verify_payment"),
    # COD Remittance
    path("remittances/", views.get_remittances, name="get_remittances"),
    path("remittances/summary/", views.remittance_summary, name="remittance_summary"),
    path(
        "remittances/<int:pk>/transfer/",
        views.transfer_remittance,
        name="transfer_remittance",
    ),
    path(
        "remittances/transfer-all/",
        views.transfer_all_remittances,
        name="transfer_all_remittances",
    ),
    # Invoices
    path("invoices/", views.get_invoices, name="get_invoices"),
]
