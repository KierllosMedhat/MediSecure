"""
Staff Serializers — Implemented by Kyrillos
"""

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from rest_framework import serializers

from .models import Staff

User = get_user_model()


class StaffListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for staff list views."""

    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)

    class Meta:
        model = Staff
        fields = [
            "id", "full_name", "email", "role",
            "hospital", "hospital_name", "department",
            "license_no", "is_active", "hired_at",
        ]

    def get_full_name(self, obj):
        u = obj.user
        parts = [u.first_name, u.middle_name, u.last_name]
        return " ".join(p for p in parts if p).strip() or u.email


class StaffDetailSerializer(serializers.ModelSerializer):
    """Full serializer for staff detail and update views."""

    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)
    upcoming_appointments = serializers.SerializerMethodField()

    class Meta:
        model = Staff
        fields = [
            "id", "user", "full_name", "email", "role",
            "hospital", "hospital_name", "department",
            "license_no", "address", "is_active", "hired_at",
            "upcoming_appointments", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def get_full_name(self, obj):
        u = obj.user
        parts = [u.first_name, u.middle_name, u.last_name]
        return " ".join(p for p in parts if p).strip() or u.email

    def get_upcoming_appointments(self, obj):
        return obj.appointments.filter(
            scheduled_at__gt=timezone.now(),
            status__in=["SCHEDULED", "CONFIRMED"],
        ).count()


class StaffCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new staff member.
    Creates a User + Staff profile in a single atomic transaction.
    """

    # User fields
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    middle_name = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    phone_number = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    role = serializers.ChoiceField(
        choices=["DOCTOR", "NURSE", "BILLING_STAFF", "ADMIN"],
        write_only=True,
    )

    class Meta:
        model = Staff
        fields = [
            "email", "password", "first_name", "middle_name", "last_name",
            "phone_number", "role",
            "hospital", "department", "license_no", "address",
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        # Doctors must have a license number
        if attrs.get("role") == "DOCTOR" and not attrs.get("license_no", "").strip():
            raise serializers.ValidationError({
                "license_no": "License number is required for DOCTOR role."
            })
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        # Extract user-specific fields
        user_fields = {
            "email": validated_data.pop("email"),
            "first_name": validated_data.pop("first_name"),
            "last_name": validated_data.pop("last_name"),
            "middle_name": validated_data.pop("middle_name", ""),
            "phone_number": validated_data.pop("phone_number", ""),
            "role": validated_data.pop("role"),
        }
        password = validated_data.pop("password")

        # Generate a username from email (required by AbstractUser)
        username = user_fields["email"].split("@")[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        # Create the User
        user = User.objects.create_user(
            username=username,
            password=password,
            **user_fields,
        )

        # Create the Staff profile with remaining fields
        staff = Staff.objects.create(user=user, **validated_data)
        return staff

    def to_representation(self, instance):
        """Return full staff detail after creation."""
        return StaffDetailSerializer(instance, context=self.context).data


class StaffDashboardSerializer(serializers.Serializer):
    """Read-only serializer for staff dashboard stats."""

    total_patients = serializers.IntegerField()
    today_appointments = serializers.IntegerField()
    pending_consents = serializers.IntegerField()
    recent_records = serializers.ListField(child=serializers.DictField())
    upcoming_appointments = serializers.ListField(child=serializers.DictField())

class StaffProfileSerializer(serializers.ModelSerializer):
    """Serializer for staff member's own profile."""
    staff_id = serializers.IntegerField(source="id", read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", required=False)
    middle_name = serializers.CharField(source="user.middle_name", required=False, allow_blank=True)
    last_name = serializers.CharField(source="user.last_name", required=False)
    phone_number = serializers.CharField(source="user.phone_number", required=False, allow_blank=True)
    role = serializers.CharField(source="user.role", read_only=True)
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Staff
        fields = [
            "id", "staff_id", "user_id", "email", "first_name", "middle_name",
            "last_name", "phone_number", "role", "full_name",
            "department", "license_no", "hospital_name", "address",
        ]
        read_only_fields = ["id", "staff_id", "user_id", "email", "role", "hospital_name", "department", "license_no"]

    def get_full_name(self, obj):
        parts = [obj.user.first_name, obj.user.middle_name, obj.user.last_name]
        return " ".join(part for part in parts if part).strip()

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        if user_data:
            instance.user.save(update_fields=list(user_data.keys()))

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

