from django.urls import path
from . import views

urlpatterns = [
    path('wallet/', views.get_wallet, name='get_wallet'),
    path('wallet/transactions/', views.get_transactions, name='get_transactions'),
    path('create-razorpay-order/', views.create_razorpay_order, name='create_razorpay_order'),
    path('verify-payment/', views.verify_payment, name='verify_payment'),
]
