"""
Accounts URLs — Owner: Abanob

Aligned to frontend authService.js & patientService.js call patterns.

Frontend calls (no trailing slashes):
  POST   /auth/login               → LoginView
  POST   /auth/logout              → LogoutView
  POST   /auth/forgot-password     → PasswordResetRequestView
  POST   /auth/verify-otp          → OTPVerificationView
  POST   /auth/reset-password      → PasswordResetConfirmView
  POST   /auth/refresh             → TokenRefreshView
  POST   /auth/change-password     → ChangePasswordView
  GET    /auth/profile             → UserProfileView
  PUT    /auth/profile             → UserProfileView
  POST   /auth/register            → RegisterView
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = "accounts"

urlpatterns = [
    # Registration & Login
    path("register", views.RegisterView.as_view(), name="register"),
    path("login", views.LoginView.as_view(), name="login"),
    path("logout", views.LogoutView.as_view(), name="logout"),

    # Token refresh — frontend calls POST /auth/refresh
    path("refresh", TokenRefreshView.as_view(), name="token-refresh"),

    # Profile
    path("profile", views.UserProfileView.as_view(), name="profile"),

    # Password Reset Flow — matched to frontend authService.js
    path("forgot-password", views.PasswordResetRequestView.as_view(), name="forgot-password"),
    path("verify-otp", views.OTPVerificationView.as_view(), name="verify-otp"),
    path("reset-password", views.PasswordResetConfirmView.as_view(), name="reset-password"),
    path("change-password", views.ChangePasswordView.as_view(), name="change-password"),
]
