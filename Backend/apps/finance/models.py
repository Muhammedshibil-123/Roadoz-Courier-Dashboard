from django.db import models
from django.conf import settings

class Wallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.user.username}'s Wallet"

class WalletTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('CREDIT', 'Credit'),
        ('DEBIT', 'Debit')
    )
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    opening_balance = models.DecimalField(max_digits=10, decimal_places=2)
    closing_balance = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    razorpay_order_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type} of {self.amount}"


class CODRemittance(models.Model):
    REMITTANCE_STATUS = (
        ('PENDING', 'Pending'),
        ('TRANSFERRED', 'Transferred'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cod_remittances')
    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='cod_remittance')
    cod_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=15, choices=REMITTANCE_STATUS, default='PENDING')
    delivered_at = models.DateTimeField()
    transferred_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-delivered_at']

    def __str__(self):
        return f"COD Remittance #{self.id} - ₹{self.cod_amount} ({self.status})"
