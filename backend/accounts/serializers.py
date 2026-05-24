"""
Accounts Serializers — Owner: Abanob

Serializers for user registration, login, profile, and password reset.
"""

from rest_framework import serializers
from .models import User


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement UserRegistrationSerializer
#   - Fields: email, password, password_confirm, first_name,
#             middle_name, last_name, phone_number, role
#   - Validate that password and password_confirm match
#   - Validate email uniqueness
#   - Hash password before saving using set_password()
#   - Return created user (exclude password from response)
# ──────────────────────────────────────────────────────
class UserRegistrationSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id", "email", "password", "password_confirm",
            "first_name", "middle_name", "last_name",
            "phone_number", "role",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, attrs):
        # TODO (Abanob): Validate password == password_confirm
        pass

    def create(self, validated_data):
        # TODO (Abanob): Remove password_confirm, create user with set_password()
        pass


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement LoginSerializer
#   - Fields: email, password
#   - Authenticate user with email + password
#   - Return JWT access + refresh tokens
#   - Raise ValidationError for invalid credentials
# ──────────────────────────────────────────────────────
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        # TODO (Abanob): Authenticate user, generate JWT tokens
        pass


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement UserProfileSerializer
#   - Fields: id, email, first_name, middle_name, last_name,
#             phone_number, role, date_joined
#   - Read-only: id, email, role, date_joined
#   - Allow update of name and phone fields
# ──────────────────────────────────────────────────────
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "middle_name",
            "last_name", "phone_number", "role", "date_joined",
        ]
        read_only_fields = ["id", "email", "role", "date_joined"]


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement PasswordResetRequestSerializer
#   - Fields: email
#   - Validate that the email exists in the database
#   - Trigger OTP generation and send via email/SMS
# ──────────────────────────────────────────────────────
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        # TODO (Abanob): Check user exists, generate and send OTP
        pass


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement OTPVerificationSerializer
#   - Fields: email, otp_code
#   - Validate OTP code against stored value
#   - Check OTP expiration (e.g., 10 minutes)
#   - Return a temporary token for password reset
# ──────────────────────────────────────────────────────
class OTPVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)

    def validate(self, attrs):
        # TODO (Abanob): Verify OTP code and expiration
        pass


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement PasswordResetConfirmSerializer
#   - Fields: token, new_password, new_password_confirm
#   - Validate the temporary reset token
#   - Validate new_password == new_password_confirm
#   - Update user's password with set_password()
# ──────────────────────────────────────────────────────
class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        # TODO (Abanob): Validate reset token, match passwords
        pass


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement ChangePasswordSerializer
#   - Fields: old_password, new_password, new_password_confirm
#   - Validate old_password against current user
#   - Validate new passwords match
#   - Update password
# ──────────────────────────────────────────────────────
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        # TODO (Abanob): Validate old password, match new passwords
        pass
