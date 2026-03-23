"""
Seed script — run with:  python manage.py shell < seed_orders.py
Creates 3-5 sample orders for EVERY status with realistic Indian customer data.
"""

import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.orders.models import Order

User = get_user_model()

# Get the first user (the seller account)
user = User.objects.first()
if not user:
    print("ERROR: No user found! Please register a user first.")
    exit()

print(f"Using user: {user.email}")

# Delete existing orders to start fresh
deleted_count = Order.objects.all().delete()[0]
print(f"Cleared {deleted_count} existing orders.")

# =============================================
# SAMPLE ORDER DATA — grouped by target status
# =============================================

orders_data = [
    # ======= PROCESSING (5 orders) =======
    {
        "customer_name": "Rahul Sharma",
        "customer_phone": "9876543210",
        "destination_address": "42 MG Road, Indiranagar, Bangalore",
        "destination_pincode": "560038",
        "weight": 1.5,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "PROCESSING",
    },
    {
        "customer_name": "Sneha Reddy",
        "customer_phone": "9845123456",
        "destination_address": "15 Jubilee Hills, Hyderabad",
        "destination_pincode": "500033",
        "weight": 0.8,
        "order_type": "COD",
        "cod_amount": 1299,
        "status": "PROCESSING",
    },
    {
        "customer_name": "Amit Patel",
        "customer_phone": "9998877665",
        "destination_address": "201 SG Highway, Ahmedabad",
        "destination_pincode": "380054",
        "weight": 2.3,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "PROCESSING",
    },
    {
        "customer_name": "Priya Nair",
        "customer_phone": "9447123456",
        "destination_address": "78 Marine Drive, Kochi",
        "destination_pincode": "682031",
        "weight": 0.5,
        "order_type": "COD",
        "cod_amount": 599,
        "status": "PROCESSING",
    },
    {
        "customer_name": "Vikram Singh",
        "customer_phone": "9811234567",
        "destination_address": "B-12 Sector 62, Noida",
        "destination_pincode": "201301",
        "weight": 3.0,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "PROCESSING",
    },
    # ======= MANIFESTED (4 orders) =======
    {
        "customer_name": "Deepika Menon",
        "customer_phone": "9876012345",
        "destination_address": "23 Anna Nagar, Chennai",
        "destination_pincode": "600040",
        "weight": 1.2,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "MANIFESTED",
    },
    {
        "customer_name": "Arjun Kapoor",
        "customer_phone": "9820456789",
        "destination_address": "56 Bandra West, Mumbai",
        "destination_pincode": "400050",
        "weight": 0.9,
        "order_type": "COD",
        "cod_amount": 2499,
        "status": "MANIFESTED",
    },
    {
        "customer_name": "Kavita Joshi",
        "customer_phone": "9412345678",
        "destination_address": "12 Civil Lines, Jaipur",
        "destination_pincode": "302006",
        "weight": 1.8,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "MANIFESTED",
    },
    {
        "customer_name": "Rohit Gupta",
        "customer_phone": "9871234560",
        "destination_address": "45 Rajouri Garden, Delhi",
        "destination_pincode": "110027",
        "weight": 2.5,
        "order_type": "COD",
        "cod_amount": 3200,
        "status": "MANIFESTED",
    },
    # ======= PICKUP_PENDING (4 orders) — need status_changed_at within last 24h =======
    {
        "customer_name": "Meera Iyer",
        "customer_phone": "9845678901",
        "destination_address": "9 Koramangala, Bangalore",
        "destination_pincode": "560034",
        "weight": 0.7,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "PICKUP_PENDING",
        "_hours_ago": 2,
    },
    {
        "customer_name": "Sanjay Deshmukh",
        "customer_phone": "9822334455",
        "destination_address": "34 FC Road, Pune",
        "destination_pincode": "411005",
        "weight": 1.0,
        "order_type": "COD",
        "cod_amount": 899,
        "status": "PICKUP_PENDING",
        "_hours_ago": 6,
    },
    {
        "customer_name": "Ananya Das",
        "customer_phone": "9830456789",
        "destination_address": "67 Park Street, Kolkata",
        "destination_pincode": "700016",
        "weight": 1.5,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "PICKUP_PENDING",
        "_hours_ago": 12,
    },
    {
        "customer_name": "Rajesh Kumar",
        "customer_phone": "9876500001",
        "destination_address": "90 Ashok Vihar, Delhi",
        "destination_pincode": "110052",
        "weight": 2.0,
        "order_type": "COD",
        "cod_amount": 1599,
        "status": "PICKUP_PENDING",
        "_hours_ago": 20,
    },
    # ======= NOT PICKED (4 orders) — expired pickup (>24h) =======
    {
        "customer_name": "Pooja Bhatt",
        "customer_phone": "9811111111",
        "destination_address": "22 Vashi, Navi Mumbai",
        "destination_pincode": "400703",
        "weight": 0.6,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "NOT_PICKED",
    },
    {
        "customer_name": "Suresh Raina",
        "customer_phone": "9899887766",
        "destination_address": "101 Gomti Nagar, Lucknow",
        "destination_pincode": "226010",
        "weight": 1.3,
        "order_type": "COD",
        "cod_amount": 750,
        "status": "NOT_PICKED",
    },
    {
        "customer_name": "Nisha Agarwal",
        "customer_phone": "9412567890",
        "destination_address": "55 Mall Road, Kanpur",
        "destination_pincode": "208001",
        "weight": 2.2,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "NOT_PICKED",
    },
    {
        "customer_name": "Karan Malhotra",
        "customer_phone": "9876111222",
        "destination_address": "88 Sector 17, Chandigarh",
        "destination_pincode": "160017",
        "weight": 0.4,
        "order_type": "COD",
        "cod_amount": 499,
        "status": "NOT_PICKED",
    },
    # ======= IN TRANSIT (5 orders) =======
    {
        "customer_name": "Aditya Verma",
        "customer_phone": "9876543001",
        "destination_address": "14 Connaught Place, New Delhi",
        "destination_pincode": "110001",
        "weight": 1.0,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "IN_TRANSIT",
    },
    {
        "customer_name": "Swati Mishra",
        "customer_phone": "9891234567",
        "destination_address": "32 Hazratganj, Lucknow",
        "destination_pincode": "226001",
        "weight": 2.0,
        "order_type": "COD",
        "cod_amount": 1899,
        "status": "IN_TRANSIT",
    },
    {
        "customer_name": "Manish Tiwari",
        "customer_phone": "9823456789",
        "destination_address": "7 Camp Area, Pune",
        "destination_pincode": "411001",
        "weight": 0.8,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "IN_TRANSIT",
    },
    {
        "customer_name": "Ritika Saxena",
        "customer_phone": "9412789012",
        "destination_address": "19 Alambagh, Lucknow",
        "destination_pincode": "226005",
        "weight": 3.5,
        "order_type": "COD",
        "cod_amount": 4500,
        "status": "IN_TRANSIT",
    },
    {
        "customer_name": "Gaurav Pandey",
        "customer_phone": "9871002003",
        "destination_address": "50 Saket, New Delhi",
        "destination_pincode": "110017",
        "weight": 1.2,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "IN_TRANSIT",
    },
    # ======= OUT FOR DELIVERY (4 orders) =======
    {
        "customer_name": "Lakshmi Rao",
        "customer_phone": "9845011122",
        "destination_address": "8 Whitefield, Bangalore",
        "destination_pincode": "560066",
        "weight": 0.9,
        "order_type": "COD",
        "cod_amount": 1100,
        "status": "OUT_FOR_DELIVERY",
    },
    {
        "customer_name": "Nikhil Chandra",
        "customer_phone": "9830678901",
        "destination_address": "45 Salt Lake, Kolkata",
        "destination_pincode": "700064",
        "weight": 1.5,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "OUT_FOR_DELIVERY",
    },
    {
        "customer_name": "Isha Khanna",
        "customer_phone": "9811445566",
        "destination_address": "29 Defence Colony, Delhi",
        "destination_pincode": "110024",
        "weight": 0.6,
        "order_type": "COD",
        "cod_amount": 799,
        "status": "OUT_FOR_DELIVERY",
    },
    {
        "customer_name": "Tarun Bhatia",
        "customer_phone": "9876009988",
        "destination_address": "71 Model Town, Ludhiana",
        "destination_pincode": "141002",
        "weight": 2.8,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "OUT_FOR_DELIVERY",
    },
    # ======= DELIVERED (5 orders) =======
    {
        "customer_name": "Shruti Pillai",
        "customer_phone": "9447789012",
        "destination_address": "16 Technopark, Trivandrum",
        "destination_pincode": "695581",
        "weight": 1.1,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "DELIVERED",
    },
    {
        "customer_name": "Mohit Bansal",
        "customer_phone": "9876222333",
        "destination_address": "63 Sector 44, Gurgaon",
        "destination_pincode": "122003",
        "weight": 0.5,
        "order_type": "COD",
        "cod_amount": 650,
        "status": "DELIVERED",
    },
    {
        "customer_name": "Riya Chopra",
        "customer_phone": "9820111222",
        "destination_address": "41 Andheri East, Mumbai",
        "destination_pincode": "400069",
        "weight": 2.0,
        "order_type": "COD",
        "cod_amount": 2100,
        "status": "DELIVERED",
    },
    {
        "customer_name": "Ashish Mehta",
        "customer_phone": "9998811223",
        "destination_address": "18 CG Road, Ahmedabad",
        "destination_pincode": "380009",
        "weight": 1.7,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "DELIVERED",
    },
    {
        "customer_name": "Divya Jain",
        "customer_phone": "9412090909",
        "destination_address": "52 Hazratganj, Lucknow",
        "destination_pincode": "226001",
        "weight": 0.3,
        "order_type": "COD",
        "cod_amount": 399,
        "status": "DELIVERED",
    },
    # ======= NDR (3 orders) =======
    {
        "customer_name": "Varun Dhawan",
        "customer_phone": "9876444555",
        "destination_address": "33 Powai, Mumbai",
        "destination_pincode": "400076",
        "weight": 1.4,
        "order_type": "COD",
        "cod_amount": 1750,
        "status": "NDR",
    },
    {
        "customer_name": "Neha Sethi",
        "customer_phone": "9811778899",
        "destination_address": "17 Lajpat Nagar, Delhi",
        "destination_pincode": "110024",
        "weight": 0.7,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "NDR",
    },
    {
        "customer_name": "Pranav Kulkarni",
        "customer_phone": "9823112233",
        "destination_address": "82 Kothrud, Pune",
        "destination_pincode": "411038",
        "weight": 2.1,
        "order_type": "COD",
        "cod_amount": 2800,
        "status": "NDR",
    },
    # ======= RTO IN TRANSIT (3 orders) =======
    {
        "customer_name": "Sakshi Jaiswal",
        "customer_phone": "9555995009",
        "destination_address": "25 Patna Junction Area, Patna",
        "destination_pincode": "800001",
        "weight": 0.8,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "RTO_IN_TRANSIT",
    },
    {
        "customer_name": "Akash Thakur",
        "customer_phone": "9876333444",
        "destination_address": "91 Shimla Road, Chandigarh",
        "destination_pincode": "160001",
        "weight": 1.6,
        "order_type": "COD",
        "cod_amount": 1200,
        "status": "RTO_IN_TRANSIT",
    },
    {
        "customer_name": "Pallavi Desai",
        "customer_phone": "9820555666",
        "destination_address": "48 Dadar West, Mumbai",
        "destination_pincode": "400028",
        "weight": 1.0,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "RTO_IN_TRANSIT",
    },
    # ======= RTO DELIVERED (3 orders) =======
    {
        "customer_name": "Vivek Oberoi",
        "customer_phone": "9811009988",
        "destination_address": "60 Vasant Kunj, Delhi",
        "destination_pincode": "110070",
        "weight": 1.3,
        "order_type": "COD",
        "cod_amount": 950,
        "status": "RTO_DELIVERED",
    },
    {
        "customer_name": "Megha Sundaram",
        "customer_phone": "9845099887",
        "destination_address": "35 HSR Layout, Bangalore",
        "destination_pincode": "560102",
        "weight": 0.4,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "RTO_DELIVERED",
    },
    {
        "customer_name": "Harish Rawat",
        "customer_phone": "9412888777",
        "destination_address": "72 Rajpur Road, Dehradun",
        "destination_pincode": "248001",
        "weight": 2.5,
        "order_type": "COD",
        "cod_amount": 1800,
        "status": "RTO_DELIVERED",
    },
    # ======= RETURN (3 orders) =======
    {
        "customer_name": "Kavya Madhavan",
        "customer_phone": "9447334455",
        "destination_address": "11 MG Road, Ernakulam",
        "destination_pincode": "682016",
        "weight": 0.9,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "RETURN",
    },
    {
        "customer_name": "Sameer Khan",
        "customer_phone": "9871445566",
        "destination_address": "28 Banjara Hills, Hyderabad",
        "destination_pincode": "500034",
        "weight": 1.8,
        "order_type": "COD",
        "cod_amount": 2200,
        "status": "RETURN",
    },
    {
        "customer_name": "Ankita Lokhande",
        "customer_phone": "9820667788",
        "destination_address": "39 Borivali West, Mumbai",
        "destination_pincode": "400092",
        "weight": 1.1,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "RETURN",
    },
    # ======= CANCELLED (3 orders) =======
    {
        "customer_name": "Rohan Mehra",
        "customer_phone": "9876777888",
        "destination_address": "65 Pitampura, Delhi",
        "destination_pincode": "110034",
        "weight": 0.5,
        "order_type": "COD",
        "cod_amount": 450,
        "status": "CANCELLED",
    },
    {
        "customer_name": "Tanvi Hegde",
        "customer_phone": "9845222333",
        "destination_address": "83 JP Nagar, Bangalore",
        "destination_pincode": "560078",
        "weight": 3.0,
        "order_type": "PREPAID",
        "cod_amount": 0,
        "status": "CANCELLED",
    },
    {
        "customer_name": "Kunal Nayyar",
        "customer_phone": "9811556677",
        "destination_address": "47 GK-1, New Delhi",
        "destination_pincode": "110048",
        "weight": 1.5,
        "order_type": "COD",
        "cod_amount": 1350,
        "status": "CANCELLED",
    },
]

# =============================================
# CREATE ALL ORDERS
# =============================================
now = timezone.now()
created = 0

for data in orders_data:
    hours_ago = data.pop("_hours_ago", None)
    status_changed_at = now - timedelta(hours=hours_ago) if hours_ago else now

    order = Order(
        user=user,
        customer_name=data["customer_name"],
        customer_phone=data["customer_phone"],
        destination_address=data["destination_address"],
        destination_pincode=data["destination_pincode"],
        weight=data["weight"],
        order_type=data["order_type"],
        cod_amount=data["cod_amount"],
        status=data["status"],
        status_changed_at=status_changed_at,
    )
    order.save()
    created += 1

print(f"\n✅ Created {created} sample orders!\n")

# Print summary
from collections import Counter

status_counts = Counter(Order.objects.values_list("status", flat=True))
print("📊 Orders by status:")
print("-" * 35)
for status, count in sorted(status_counts.items()):
    print(f"  {status:20s} → {count}")
print("-" * 35)
print(f"  {'TOTAL':20s} → {sum(status_counts.values())}")
