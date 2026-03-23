from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ChangePasswordView,
    CustomTokenjwtView,
    CustomTokenRefreshView,
    ForgotPasswordView,
    GeneralDetailsView,
    KYCView,
    LabelSettingView,
    LogoutView,
    NonDeliveryPincodeViewSet,
    PickupAddressViewSet,
    RegisterView,
    ResetPasswordView,
    RTOAddressViewSet,
    VerifyOTPView,
    admin_ticket_reply,
    all_open_tickets,
    check_pincode,
    ticket_close,
    ticket_detail,
    ticket_list_create,
    ticket_reply,
    ticket_summary,
)

router = DefaultRouter()
router.register(r"pickup-address", PickupAddressViewSet, basename="pickup-address")
router.register(r"rto-address", RTOAddressViewSet, basename="rto-address")
router.register(
    r"non-delivery-pincodes",
    NonDeliveryPincodeViewSet,
    basename="non-delivery-pincodes",
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth_register"),
    path("verify-otp/", VerifyOTPView.as_view(), name="auth_verify_otp"),
    path("login/", CustomTokenjwtView.as_view(), name="auth_login"),
    path("token/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="auth_logout"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot_password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset_password"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    # Settings and Addresses
    path("settings/general/", GeneralDetailsView.as_view(), name="settings_general"),
    path("settings/kyc/", KYCView.as_view(), name="settings_kyc"),
    path("settings/label/", LabelSettingView.as_view(), name="settings_label"),
    path("settings/", include(router.urls)),
    # Tools
    path("check-pincode/", check_pincode, name="check_pincode"),
    # Support Tickets
    path("tickets/", ticket_list_create, name="ticket_list_create"),
    path("tickets/summary/", ticket_summary, name="ticket_summary"),
    path("tickets/open-all/", all_open_tickets, name="all_open_tickets"),
    path("tickets/<str:ticket_id>/", ticket_detail, name="ticket_detail"),
    path("tickets/<str:ticket_id>/reply/", ticket_reply, name="ticket_reply"),
    path("tickets/<str:ticket_id>/close/", ticket_close, name="ticket_close"),
    path(
        "tickets/<str:ticket_id>/admin-reply/",
        admin_ticket_reply,
        name="admin_ticket_reply",
    ),
]
