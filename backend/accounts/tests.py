from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from .models import PasswordResetOTP

User = get_user_model()


@override_settings(DEBUG=True)
class AccountsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def create_user(self, **overrides):
        data = {
            "username": "patient@example.com",
            "email": "patient@example.com",
            "first_name": "Mina",
            "last_name": "Nashat",
            "role": User.Role.PATIENT,
        }
        data.update(overrides)
        return User.objects.create_user(password="StrongPass123!", **data)

    def authenticate(self, user):
        response = self.client.post(
            "/api/v1/auth/login",
            {"email": user.email, "password": "StrongPass123!"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        return response.data

    def test_register_returns_user_and_compatible_tokens(self):
        response = self.client.post(
            "/api/v1/auth/register",
            {
                "email": "new@example.com",
                "password": "StrongPass123!",
                "password_confirm": "StrongPass123!",
                "first_name": "New",
                "last_name": "Patient",
                "role": User.Role.PATIENT,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["access"], response.data["access_token"])
        self.assertEqual(response.data["refresh"], response.data["refresh_token"])
        self.assertEqual(response.data["user"]["email"], "new@example.com")

    def test_login_profile_update_and_logout(self):
        user = self.create_user()
        tokens = self.authenticate(user)

        profile = self.client.patch(
            "/api/v1/auth/profile",
            {"phone_number": "01012345678"},
            format="json",
        )
        self.assertEqual(profile.status_code, status.HTTP_200_OK)
        self.assertEqual(profile.data["phone_number"], "01012345678")

        logout = self.client.post(
            "/api/v1/auth/logout",
            {"refresh": tokens["refresh"]},
            format="json",
        )
        self.assertEqual(logout.status_code, status.HTTP_200_OK)

    def test_password_reset_flow(self):
        user = self.create_user()

        request = self.client.post(
            "/api/v1/auth/forgot-password",
            {"email": user.email},
            format="json",
        )
        self.assertEqual(request.status_code, status.HTTP_200_OK)
        self.assertEqual(PasswordResetOTP.objects.filter(user=user).count(), 1)

        otp = request.data["otp"]
        verify = self.client.post(
            "/api/v1/auth/verify-otp",
            {"email": user.email, "otp": otp},
            format="json",
        )
        self.assertEqual(verify.status_code, status.HTTP_200_OK)
        self.assertIn("reset_token", verify.data)

        confirm = self.client.post(
            "/api/v1/auth/reset-password",
            {
                "token": verify.data["reset_token"],
                "new_password": "NewStrongPass123!",
                "new_password_confirm": "NewStrongPass123!",
            },
            format="json",
        )
        self.assertEqual(confirm.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password("NewStrongPass123!"))

    def test_change_password_validates_old_password(self):
        user = self.create_user()
        self.authenticate(user)

        bad = self.client.post(
            "/api/v1/auth/change-password",
            {
                "old_password": "wrong",
                "new_password": "NewStrongPass123!",
                "new_password_confirm": "NewStrongPass123!",
            },
            format="json",
        )
        self.assertEqual(bad.status_code, status.HTTP_400_BAD_REQUEST)

        good = self.client.post(
            "/api/v1/auth/change-password",
            {
                "old_password": "StrongPass123!",
                "new_password": "NewStrongPass123!",
                "new_password_confirm": "NewStrongPass123!",
            },
            format="json",
        )
        self.assertEqual(good.status_code, status.HTTP_200_OK)
