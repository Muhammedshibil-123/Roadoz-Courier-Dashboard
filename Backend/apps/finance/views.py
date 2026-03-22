import razorpay
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import decimal
from django.conf import settings
from .models import Wallet, WalletTransaction
from .serializers import WalletSerializer, WalletTransactionSerializer

RAZOR_KEY_ID = 'rzp_test_RtB2jZWP6x28Ez'
RAZOR_KEY_SECRET = 'FVa5j3jCh2LMeLHwk7mfDuEE'

client = razorpay.Client(auth=(RAZOR_KEY_ID, RAZOR_KEY_SECRET))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wallet(request):
    wallet, created = Wallet.objects.get_or_create(user=request.user)
    serializer = WalletSerializer(wallet)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transactions(request):
    wallet, created = Wallet.objects.get_or_create(user=request.user)
    transactions = wallet.transactions.all()
    serializer = WalletTransactionSerializer(transactions, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_razorpay_order(request):
    amount = request.data.get('amount')
    if not amount:
        return Response({'detail': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        amount_int = int(float(amount) * 100) # Razorpay needs amount in paise (1 INR = 100 paise)
        order_data = {
            'amount': amount_int,
            'currency': 'INR',
            'payment_capture': 1 # Auto capture
        }
        order = client.order.create(data=order_data)
        return Response({
            'order_id': order['id'],
            'amount': order['amount'],
            'currency': order['currency'],
            'key': RAZOR_KEY_ID
        })
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    razorpay_payment_id = request.data.get('razorpay_payment_id')
    razorpay_order_id = request.data.get('razorpay_order_id')
    razorpay_signature = request.data.get('razorpay_signature')
    amount = request.data.get('amount') # we need to know how much to add

    if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature, amount]):
        return Response({'detail': 'All payment details and amount are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Verify signature
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        # Throws SignatureVerificationError on failure
        client.utility.verify_payment_signature(params_dict)

        wallet, created = Wallet.objects.get_or_create(user=request.user)
        
        amount_decimal = float(amount)
        opening_balance = wallet.balance
        wallet.balance += max(decimal.Decimal(str(amount_decimal)), decimal.Decimal('0.00')) # ensure it's positive just in case
        closing_balance = wallet.balance
        wallet.save()

        # Create wallet transaction
        WalletTransaction.objects.create(
            wallet=wallet,
            amount=amount_decimal,
            transaction_type='CREDIT',
            opening_balance=opening_balance,
            closing_balance=closing_balance,
            description=f'Wallet deposit via Razorpay (Order: {razorpay_order_id})',
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id
        )

        return Response({'detail': 'Payment verified and wallet credited successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
