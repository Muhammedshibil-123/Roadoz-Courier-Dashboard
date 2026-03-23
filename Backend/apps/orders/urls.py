from django.urls import path
from . import views

urlpatterns = [
    path("", views.OrderListCreateView.as_view(), name="order-list-create"),
    path("stats/", views.order_stats, name="order-stats"),
    path("consignees/", views.consignees_list, name="consignees-list"),
    path("check-not-picked/", views.check_not_picked, name="check-not-picked"),
    path("export/", views.export_orders_csv, name="export_orders_csv"),
    path("<int:pk>/", views.OrderDetailView.as_view(), name="order-detail"),
    path("<int:pk>/advance/", views.advance_order, name="order-advance"),
    path("<int:order_id>/status/", views.update_order_status, name="order-update-status"),
]
