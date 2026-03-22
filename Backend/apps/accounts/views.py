import random

from django.conf import settings
from django.core.mail import send_mail
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import CustomUser
from .serializers import (
    ChangePasswordSerializer,
    CustomTokenJwtSerializer,
    ForgotPasswordSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserSerializer,
    VerifyOTPSerializer,
)


def _generate_otp() -> str:
    return str(random.randint(100000, 999999))


def _send_otp_email(subject: str, body: str, recipient: str) -> None:
    send_mail(subject, body, settings.EMAIL_HOST_USER, [recipient], fail_silently=False)


def _set_refresh_cookie(response, refresh_token) -> None:
    jwt = settings.SIMPLE_JWT

    
    
    lifetime = jwt["REFRESH_TOKEN_LIFETIME"]
    max_age_seconds = int(lifetime.total_seconds())

    response.set_cookie(
        key=jwt["AUTH_COOKIE"],
        value=str(refresh_token),
        max_age=max_age_seconds,              
        path=jwt.get("AUTH_COOKIE_PATH", "/"),
        domain=jwt.get("AUTH_COOKIE_DOMAIN"), 
        secure=jwt["AUTH_COOKIE_SECURE"],
        httponly=jwt["AUTH_COOKIE_HTTP_ONLY"],
        samesite=jwt["AUTH_COOKIE_SAMESITE"],
    )


class RegisterView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    @swagger_auto_schema(
        operation_description=(
            "Register a new employee account.\n\n"
            "- Validates the `secret_code` (must be `employee1234`)\n"
            "- Creates an **inactive** account\n"
            "- Sends a 6-digit OTP to the provided email\n"
            "- If the email already exists but is unverified, resends a fresh OTP"
        ),
        tags=["Authentication"],
        request_body=RegisterSerializer,
        responses={
            201: openapi.Response("Account created. OTP sent to email."),
            200: openapi.Response("Account exists but unverified. New OTP sent."),
            400: openapi.Response("Validation error."),
            409: openapi.Response("Email already registered and verified."),
        },
    )
    def post(self, request, *args, **kwargs):
        email = request.data.get("email", "").lower().strip()

        existing = CustomUser.objects.filter(email__iexact=email).first()
        if existing:
            if not existing.is_active:
                otp = _generate_otp()
                existing.otp = otp
                existing.save(update_fields=["otp"])
                _send_otp_email(
                    "Courier Dashboard – Verification Code",
                    (
                        f"Hi {existing.username},\n\n"
                        f"Your new verification code is: {otp}\n\n"
                        "This code expires in 10 minutes. Do not share it with anyone."
                    ),
                    existing.email,
                )
                return Response(
                    {"message": "Account already exists but is not verified. A new OTP has been sent to your email."},
                    status=status.HTTP_200_OK,
                )
            return Response(
                {"error": "An account with this email already exists."},
                status=status.HTTP_409_CONFLICT,
            )

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        otp = _generate_otp()
        user.otp = otp
        user.save(update_fields=["otp"])

        _send_otp_email(
            "Courier Dashboard – Verify Your Account",
            (
                f"Hi {user.username},\n\n"
                f"Welcome! Your verification code is: {otp}\n\n"
                "Enter this code to activate your account. Do not share it with anyone."
            ),
            user.email,
        )

        return Response(
            {"message": "Account created. Please check your email for the verification code."},
            status=status.HTTP_201_CREATED,
        )


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description=(
            "Verify the 6-digit OTP sent during registration.\n\n"
            "On success the account is **activated** and JWT tokens are returned.\n"
            "The refresh token is stored in an **HttpOnly cookie**."
        ),
        tags=["Authentication"],
        request_body=VerifyOTPSerializer,
        responses={
            200: openapi.Response("Account verified. Returns access token + user info."),
            400: openapi.Response("Invalid OTP."),
            404: openapi.Response("User not found."),
        },
    )
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]

        try:
            user = CustomUser.objects.get(email__iexact=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.otp != otp:
            return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = True
        user.otp = None
        user.save(update_fields=["is_active", "otp"])

        refresh = RefreshToken.for_user(user)
        response = Response(
            {
                "message": "Account verified successfully!",
                "access": str(refresh.access_token),
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            status=status.HTTP_200_OK,
        )
        _set_refresh_cookie(response, refresh)
        return response


class CustomTokenjwtView(TokenObtainPairView):
    serializer_class = CustomTokenJwtSerializer

    @swagger_auto_schema(
        operation_description=(
            "Obtain JWT access and refresh tokens.\n\n"
            "- Accepts **username or email** in the `username` field\n"
            "- The **refresh token** is stored in an HttpOnly cookie\n"
            "- Only the **access token** is returned in the response body"
        ),
        tags=["Authentication"],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["username", "password"],
            properties={
                "username": openapi.Schema(type=openapi.TYPE_STRING),
                "password": openapi.Schema(type=openapi.TYPE_STRING),
            },
        ),
        responses={
            200: openapi.Response("Login successful."),
            401: openapi.Response("Invalid credentials or account not activated."),
        },
    )
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            refresh_token = response.data.pop("refresh", None)
            if refresh_token:
                _set_refresh_cookie(response, refresh_token)
        return response


class CustomTokenRefreshView(TokenRefreshView):

    @swagger_auto_schema(
        operation_description=(
            "Silently refresh the access token using the **HttpOnly refresh cookie**.\n\n"
            "No request body needed — the cookie is read automatically.\n"
            "Also returns the latest user details."
        ),
        tags=["Authentication"],
        request_body=openapi.Schema(type=openapi.TYPE_OBJECT, properties={}),
        responses={
            200: openapi.Response("New access token issued."),
            401: openapi.Response("Invalid or expired refresh token."),
        },
    )
    def post(self, request, *args, **kwargs):
        
        
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE"])
        if refresh_token:
            
            request.data["refresh"] = refresh_token

        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                
                new_refresh = response.data.pop("refresh", None)
                if new_refresh:
                    _set_refresh_cookie(response, new_refresh)

                
                access_str = response.data.get("access")
                if access_str:
                    user_id = AccessToken(access_str)["user_id"]
                    user = CustomUser.objects.get(id=user_id)
                    response.data["user"] = UserSerializer(user).data

            return response

        except (InvalidToken, TokenError, CustomUser.DoesNotExist):
            resp = Response(
                {"error": "Invalid or expired session. Please log in again."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            resp.delete_cookie(
                settings.SIMPLE_JWT["AUTH_COOKIE"],
                path=settings.SIMPLE_JWT.get("AUTH_COOKIE_PATH", "/"),
            )
            return resp


class LogoutView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Blacklist the refresh token and clear the HttpOnly auth cookie.",
        tags=["Authentication"],
        request_body=openapi.Schema(type=openapi.TYPE_OBJECT, properties={}),
        responses={200: openapi.Response("Logged out successfully.")},
    )
    def post(self, request):
        refresh_token = (
            request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE"])
            or request.data.get("refresh")
        )

        response = Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)
        response.delete_cookie(
            settings.SIMPLE_JWT["AUTH_COOKIE"],
            path=settings.SIMPLE_JWT.get("AUTH_COOKIE_PATH", "/"),
        )

        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                pass

        return response


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Request a password-reset OTP via email.",
        tags=["Password"],
        request_body=ForgotPasswordSerializer,
        responses={200: openapi.Response("OTP sent if the account exists.")},
    )
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]

        try:
            user = CustomUser.objects.get(email__iexact=email)
            otp = _generate_otp()
            user.otp = otp
            user.save(update_fields=["otp"])
            _send_otp_email(
                "Courier Dashboard – Password Reset Code",
                (
                    f"Hi {user.username},\n\n"
                    f"Your password reset code is: {otp}\n\n"
                    "This code expires in 10 minutes. If you did not request this, "
                    "please ignore this email."
                ),
                user.email,
            )
        except CustomUser.DoesNotExist:
            pass

        return Response(
            {"message": "If an account with that email exists, a reset code has been sent."},
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Reset the account password using the OTP received by email.",
        tags=["Password"],
        request_body=ResetPasswordSerializer,
        responses={
            200: openapi.Response("Password reset successfully."),
            400: openapi.Response("Invalid or expired OTP."),
            404: openapi.Response("User not found."),
        },
    )
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]
        new_password = serializer.validated_data["new_password"]

        try:
            user = CustomUser.objects.get(email__iexact=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if not user.otp or user.otp != otp:
            return Response(
                {"error": "Invalid or expired OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.otp = None
        user.save(update_fields=["password", "otp"])

        return Response(
            {"message": "Password reset successfully. You can now log in."},
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Change the password for the currently authenticated user.",
        tags=["Password"],
        request_body=ChangePasswordSerializer,
        responses={
            200: openapi.Response("Password changed successfully."),
            400: openapi.Response("Old password incorrect or passwords mismatch."),
        },
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        old_password = serializer.validated_data["old_password"]
        new_password = serializer.validated_data["new_password"]

        if not user.check_password(old_password):
            return Response(
                {"error": "Old password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if old_password == new_password:
            return Response(
                {"error": "New password must be different from the old password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)


# --- Settings and Addresses Views ---
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from .models import PickupAddress, RTOAddress, LabelSetting
from .serializers import (
    GeneralDetailsSerializer,
    KYCSerializer,
    PickupAddressSerializer,
    RTOAddressSerializer,
    LabelSettingSerializer
)

class GeneralDetailsView(generics.RetrieveUpdateAPIView):
    serializer_class = GeneralDetailsSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        return self.request.user


class KYCView(generics.RetrieveUpdateAPIView):
    serializer_class = KYCSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        # When user submits KYC form, mark status as pending
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(kyc_status="pending")
        return Response(serializer.data)


class PickupAddressViewSet(viewsets.ModelViewSet):
    serializer_class = PickupAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PickupAddress.objects.filter(user=self.request.user).order_by('-id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RTOAddressViewSet(viewsets.ModelViewSet):
    serializer_class = RTOAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RTOAddress.objects.filter(user=self.request.user).order_by('-id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LabelSettingView(generics.RetrieveUpdateAPIView):
    serializer_class = LabelSettingSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        # Get or create label settings for user
        obj, created = LabelSetting.objects.get_or_create(user=self.request.user)
        return obj
