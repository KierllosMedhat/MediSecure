"""
Accounts serializers for registration, login, profile, and password reset.
"""

import secrets
from datetime import timedelta

from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import PasswordResetOTP, User


OTP_TTL_MINUTES = 10
RESET_TOKEN_TTL_MINUTES = 15
MAX_OTP_ATTEMPTS = 5


def _password_validation_error(password, user=None):
    try:
        validate_password(password, user=user)
    except DjangoValidationError as exc:
        raise serializers.ValidationError(list(exc.messages))


def build_token_response(user):
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    refresh_token = str(refresh)
    return {
        "access": access,
        "refresh": refresh_token,
        "access_token": access,
        "refresh_token": refresh_token,
    }


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "middle_name",
            "last_name",
            "phone_number",
            "role",
            "date_joined",
        ]
        read_only_fields = ["id", "username", "email", "role", "date_joined"]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "middle_name",
            "last_name",
            "phone_number",
            "role",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate_role(self, value):
        allowed_roles = {choice[0] for choice in User.Role.choices}
        if value not in allowed_roles:
            raise serializers.ValidationError("Invalid role.")
        return value

    def validate(self, attrs):
        password = attrs.get("password")
        password_confirm = attrs.get("password_confirm")
        if password_confirm is not None and password != password_confirm:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        _password_validation_error(password)
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm", None)
        password = validated_data.pop("password")
        email = validated_data.get("email", "").strip().lower()
        username = validated_data.get("username") or email

        user = User(**validated_data)
        user.email = email
        user.username = username
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        request = self.context.get("request")
        email = attrs["email"].strip().lower()
        password = attrs["password"]
        user = authenticate(request=request, username=email, password=password)

        if user is None:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")

        attrs["user"] = user
        attrs.update(build_token_response(user))
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.strip().lower()

    def save(self):
        email = self.validated_data["email"]
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        otp = f"{secrets.randbelow(1000000):06d}"

        if user:
            PasswordResetOTP.objects.filter(user=user, is_used=False).update(is_used=True)
            PasswordResetOTP.objects.create(
                user=user,
                otp_hash=make_password(otp),
                expires_at=timezone.now() + timedelta(minutes=OTP_TTL_MINUTES),
            )
            send_mail(
                subject="MediSecure password reset code",
                message=f"Your MediSecure password reset code is {otp}. It expires in {OTP_TTL_MINUTES} minutes.",
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
                recipient_list=[user.email],
                fail_silently=True,
            )

        return {"otp": otp if settings.DEBUG and user else None}


class OTPFlowSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, required=False, write_only=True)
    otp_code = serializers.CharField(max_length=6, required=False, write_only=True)

    def validate(self, attrs):
        email = attrs["email"].strip().lower()
        otp = attrs.get("otp") or attrs.get("otp_code")
        if not otp:
            raise serializers.ValidationError({"otp": "OTP is required."})
        if not otp.isdigit() or len(otp) != 6:
            raise serializers.ValidationError({"otp": "OTP must be exactly 6 digits."})

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        record = None
        if user:
            record = (
                PasswordResetOTP.objects.filter(user=user, is_used=False)
                .order_by("-created_at")
                .first()
            )

        if not record or record.is_expired:
            raise serializers.ValidationError("Invalid or expired OTP.")
        if record.attempts >= MAX_OTP_ATTEMPTS:
            raise serializers.ValidationError("Too many failed OTP attempts.")
        if not check_password(otp, record.otp_hash):
            record.attempts += 1
            record.save(update_fields=["attempts"])
            raise serializers.ValidationError("Invalid or expired OTP.")

        reset_token = secrets.token_urlsafe(32)
        record.verified_at = timezone.now()
        record.reset_token_hash = make_password(reset_token)
        record.reset_token_expires_at = timezone.now() + timedelta(minutes=RESET_TOKEN_TTL_MINUTES)
        record.save(update_fields=["verified_at", "reset_token_hash", "reset_token_expires_at"])

        attrs["user"] = user
        attrs["otp_record"] = record
        attrs["reset_token"] = reset_token
        return attrs


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(required=False, write_only=True)
    email = serializers.EmailField(required=False, write_only=True)
    otp = serializers.CharField(max_length=6, required=False, write_only=True)
    otp_code = serializers.CharField(max_length=6, required=False, write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True, required=False)

    def validate(self, attrs):
        password = attrs["new_password"]
        password_confirm = attrs.get("new_password_confirm")
        if password_confirm is not None and password != password_confirm:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match."})

        record = self._get_record(attrs)
        if not record or record.is_used or not record.verified_at:
            raise serializers.ValidationError("Invalid or expired reset token.")
        if record.is_reset_token_expired:
            raise serializers.ValidationError("Invalid or expired reset token.")

        _password_validation_error(password, user=record.user)
        attrs["otp_record"] = record
        attrs["user"] = record.user
        return attrs

    def _get_record(self, attrs):
        token = attrs.get("token")
        if token:
            candidates = PasswordResetOTP.objects.filter(
                is_used=False,
                verified_at__isnull=False,
                reset_token_hash__gt="",
            ).order_by("-created_at")
            for candidate in candidates:
                if check_password(token, candidate.reset_token_hash):
                    return candidate
            return None

        email = attrs.get("email", "").strip().lower()
        otp = attrs.get("otp") or attrs.get("otp_code")
        if not email or not otp:
            raise serializers.ValidationError("Provide reset token or email and OTP.")
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if not user:
            return None
        record = (
            PasswordResetOTP.objects.filter(
                user=user,
                is_used=False,
                verified_at__isnull=False,
            )
            .order_by("-created_at")
            .first()
        )
        if record and check_password(otp, record.otp_hash):
            return record
        return None

    def save(self):
        record = self.validated_data["otp_record"]
        user = self.validated_data["user"]
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        record.is_used = True
        record.save(update_fields=["is_used"])
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context["request"].user
        if not user.check_password(attrs["old_password"]):
            raise serializers.ValidationError({"old_password": "Old password is incorrect."})
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match."})
        _password_validation_error(attrs["new_password"], user=user)
        return attrs

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user


# Backward-compatible names from the scaffold.
OTPVerificationSerializer = OTPFlowSerializer
