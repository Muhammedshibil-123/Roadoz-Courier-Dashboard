import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.orders.models import Order
from apps.finance.models import Wallet, WalletTransaction
from apps.orders.serializers import OrderSerializer
from apps.orders.views import OrderListCreateView, advance_order, update_order_status
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()
User = get_user_model()
user = User.objects.first()

print(f"Testing for user: {user.username}")

wallet, _ = Wallet.objects.get_or_create(user=user)
initial_balance = wallet.balance
print(f"Initial Balance: {initial_balance}")

# 1. Test PREPAID order creation
print("\n--- Testing PREPAID Order Creation ---")
request = factory.post('/api/orders/', {
    'customer_name': 'Test Cust',
    'customer_phone': '1234567890',
    'destination_address': 'Test Address',
    'destination_pincode': '123456',
    'weight': 1.0,
    'order_type': 'PREPAID',
    'product_amount': 500.00
}, format='json')
request.user = user

view = OrderListCreateView.as_view()
response = view(request)
print(f"PREPAID Create Response: {response.status_code}")

wallet.refresh_from_db()
print(f"Balance after PREPAID create (Expected +500): {wallet.balance}")

# 2. Test PREPAID Order Return
print("\n--- Testing PREPAID Order Return ---")
order_id = response.data['id']
request = factory.patch(f'/api/orders/{order_id}/status/', {
    'status': 'RETURN'
}, format='json')
request.user = user

response = update_order_status(request, order_id=order_id)
print(f"RETURN Update Response: {response.status_code}")

wallet.refresh_from_db()
print(f"Balance after RETURN (Expected -500): {wallet.balance}")


# 3. Test COD Order Delivery
print("\n--- Testing COD Order Delivery ---")
request = factory.post('/api/orders/', {
    'customer_name': 'Test Cust2',
    'customer_phone': '1234567890',
    'destination_address': 'Test Address',
    'destination_pincode': '123456',
    'weight': 1.0,
    'order_type': 'COD',
    'cod_amount': 300.00,
    'product_amount': 300.00
}, format='json')
request.user = user
response = view(request)
cod_order_id = response.data['id']
print(f"COD Create Response: {response.status_code}")

wallet.refresh_from_db()
print(f"Balance after COD create (Expected unchanged): {wallet.balance}")

request = factory.patch(f'/api/orders/{cod_order_id}/status/', {
    'status': 'DELIVERED'
}, format='json')
request.user = user

response = update_order_status(request, order_id=cod_order_id)
print(f"DELIVERED Update Response: {response.status_code}")

wallet.refresh_from_db()
print(f"Balance after DELIVERED (Expected +300): {wallet.balance}")
