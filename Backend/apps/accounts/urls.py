from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ChangePasswordView,
    CustomTokenjwtView,
    CustomTokenRefreshView,
    ForgotPasswordView,
    LogoutView,
    RegisterView,
    ResetPasswordView,
    VerifyOTPView,
    GeneralDetailsView,
    KYCView,
    PickupAddressViewSet,
    RTOAddressViewSet,
    LabelSettingView,
)

router = DefaultRouter()
router.register(r'pickup-address', PickupAddressViewSet, basename='pickup-address')
router.register(r'rto-address', RTOAddressViewSet, basename='rto-address')

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
]