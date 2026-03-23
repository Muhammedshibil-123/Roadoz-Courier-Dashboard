from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=15, null=True, blank=True)
    otp = models.CharField(max_length=6, null=True, blank=True)
    
    # Cloudinary image — stored in project-specific folder
    profile_image = models.ImageField(upload_to='roadoz-courier-dashboard/profile_images/', null=True, blank=True)
    
    # Settings and KYC
    order_report_email = models.EmailField(null=True, blank=True)
    full_name = models.CharField(max_length=150, null=True, blank=True)
    business_name = models.CharField(max_length=150, null=True, blank=True)
    pan_number = models.CharField(max_length=20, null=True, blank=True)
    aadhar_number = models.CharField(max_length=20, null=True, blank=True)
    gst_number = models.CharField(max_length=20, null=True, blank=True)
    bank_account_number = models.CharField(max_length=30, null=True, blank=True)
    ifsc_code = models.CharField(max_length=20, null=True, blank=True)
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    
    KYC_STATUS_CHOICES = (
        ("unverified", "Unverified"),
        ("pending", "Pending"),
        ("verified", "Verified"),
        ("rejected", "Rejected"),
    )
    kyc_status = models.CharField(max_length=20, choices=KYC_STATUS_CHOICES, default="unverified")

    STATUS_CHOICES = (
        ("active", "Active"),
        ("inactive", "Inactive"),
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")

    groups = models.ManyToManyField(
        "auth.Group",
        blank=True,
        help_text="The groups this user belongs to.",
        verbose_name="groups",
        related_name="courier_customuser_set",
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
        related_name="courier_customuser_set",
    )

    def __str__(self):
        return self.username


class PickupAddress(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="pickup_addresses")
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField(null=True, blank=True)
    pincode = models.CharField(max_length=10)
    address = models.TextField()
    warehouse_name = models.CharField(max_length=100, null=True, blank=True)
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.pincode}"

    def save(self, *args, **kwargs):
        if self.is_primary:
            PickupAddress.objects.filter(user=self.user, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)


class RTOAddress(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="rto_addresses")
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField(null=True, blank=True)
    pincode = models.CharField(max_length=10)
    address = models.TextField()
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"RTO: {self.name} - {self.pincode}"

    def save(self, *args, **kwargs):
        if self.is_primary:
            RTOAddress.objects.filter(user=self.user, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)


class LabelSetting(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="label_setting")
    print_type = models.CharField(max_length=20, default="Thermal")
    show_order_value = models.BooleanField(default=True)
    show_cod_amount = models.BooleanField(default=True)
    show_buyer_mobile = models.BooleanField(default=True)
    show_shipper_mobile = models.BooleanField(default=True)
    show_product_name = models.BooleanField(default=True)
    show_services_tc = models.BooleanField(default=True)
    label_logo_url = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self):
        return f"Label Settings for {self.user.username}"


class NonDeliveryPincode(models.Model):
    pincode = models.CharField(max_length=10, unique=True)
    reason = models.CharField(max_length=200, null=True, blank=True)
    added_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name="blocked_pincodes")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Non-Delivery: {self.pincode}"

    class Meta:
        ordering = ['pincode']


class SupportTicket(models.Model):
    PRIORITY_CHOICES = (
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    )
    STATUS_CHOICES = (
        ('OPEN', 'Open'),
        ('ANSWERED', 'Answered'),
        ('CLOSED', 'Closed'),
    )
    CATEGORY_CHOICES = (
        ('DELIVERY_ISSUE', 'Delivery Issue'),
        ('WEIGHT_DISPUTE', 'Weight Dispute'),
        ('STUCK_IN_TRANSIT', 'Stuck in Transit'),
        ('PAYMENT_ISSUE', 'Payment Issue'),
        ('OTHER', 'Other'),
    )

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='tickets')
    order = models.ForeignKey('orders.Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets')
    ticket_id = models.CharField(max_length=20, unique=True, editable=False, db_index=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='OTHER')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"#{self.ticket_id} — {self.subject}"

    def save(self, *args, **kwargs):
        if not self.ticket_id:
            import random
            tid = f"TKT-{random.randint(1000, 9999)}"
            while SupportTicket.objects.filter(ticket_id=tid).exists():
                tid = f"TKT-{random.randint(1000, 9999)}"
            self.ticket_id = tid
        super().save(*args, **kwargs)


class TicketReply(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='replies')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    message = models.TextField()
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        sender = "Admin" if self.is_admin else self.user.username
        return f"Reply by {sender} on #{self.ticket.ticket_id}"