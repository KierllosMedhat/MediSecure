"""
Accounts Views — Owner: Abanob

API views for user registration, login, JWT token management,
password reset, and user profile.
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import User
from .serializers import (
    UserRegistrationSerializer,
    LoginSerializer,
    UserProfileSerializer,
    PasswordResetRequestSerializer,
    OTPVerificationSerializer,
    PasswordResetConfirmSerializer,
    ChangePasswordSerializer,
)


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement RegisterView
#   - POST /api/v1/auth/register/
#   - Accept registration data, validate, create user
#   - Return user data + JWT tokens (auto-login after signup)
#   - Permission: AllowAny
# ──────────────────────────────────────────────────────
class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # TODO (Abanob): Create user, generate JWT tokens, return response
        pass


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement LoginView
#   - POST /api/v1/auth/login/
#   - Accept email + password, authenticate user
#   - Return JWT access + refresh tokens + user profile data
#   - Permission: AllowAny
# ──────────────────────────────────────────────────────
class LoginView(APIView):
    """User login endpoint."""
    permission_classes = [AllowAny]

    def post(self, request):
        # TODO (Abanob): Validate credentials, return tokens + user data
        pass


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement LogoutView
#   - POST /api/v1/auth/logout/
#   - Accept refresh token, blacklist it
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────
class LogoutView(APIView):
    """User logout — blacklists the refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # TODO (Abanob): Blacklist the refresh token
        pass


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement UserProfileView
#   - GET  /api/v1/auth/profile/ → return current user's profile
#   - PUT  /api/v1/auth/profile/ → update current user's profile
#   - PATCH /api/v1/auth/profile/ → partial update
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────
class UserProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve and update the authenticated user's profile."""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # TODO (Abanob): Return request.user
        pass


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement PasswordResetRequestView
#   - POST /api/v1/auth/password-reset/
#   - Accept email, generate OTP, send via email/SMS
#   - Return success message (don't reveal if email exists)
#   - Permission: AllowAny
# ──────────────────────────────────────────────────────
class PasswordResetRequestView(APIView):
    """Request a password reset — sends OTP to email/phone."""
    permission_classes = [AllowAny]

    def post(self, request):
        # TODO (Abanob): Generate OTP, send email/SMS, return success
        pass


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement OTPVerificationView
#   - POST /api/v1/auth/verify-otp/
#   - Accept email + otp_code, verify OTP
#   - Return temporary reset token on success
#   - Permission: AllowAny
# ──────────────────────────────────────────────────────
class OTPVerificationView(APIView):
    """Verify OTP code for password reset."""
    permission_classes = [AllowAny]

    def post(self, request):
        # TODO (Abanob): Verify OTP, return reset token
        pass


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement PasswordResetConfirmView
#   - POST /api/v1/auth/password-reset/confirm/
#   - Accept reset token + new password
#   - Update user's password
#   - Permission: AllowAny
# ──────────────────────────────────────────────────────
class PasswordResetConfirmView(APIView):
    """Confirm password reset with token and new password."""
    permission_classes = [AllowAny]

    def post(self, request):
        # TODO (Abanob): Validate token, update password
        pass


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement ChangePasswordView
#   - POST /api/v1/auth/change-password/
#   - Accept old_password + new_password
#   - Verify old password, update to new
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────
class ChangePasswordView(APIView):
    """Change password for authenticated user."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # TODO (Abanob): Validate old password, set new password
        pass
