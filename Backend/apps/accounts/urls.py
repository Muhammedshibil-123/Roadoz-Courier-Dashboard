from django.urls import path

from .views import (
    ChangePasswordView,
    CustomTokenjwtView,
    CustomTokenRefreshView,
    ForgotPasswordView,
    LogoutView,
    RegisterView,
    ResetPasswordView,
    VerifyOTPView,
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
]