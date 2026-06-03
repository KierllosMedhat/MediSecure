"""
Patients serializers for profile CRUD and dashboard statistics.
"""

import re

from rest_framework import serializers

from .models import Patient

NATIONAL_ID_RE = re.compile(r"^\d{14}$")


class NullableDateField(serializers.DateField):
    def to_internal_value(self, value):
        if value == "":
            return None
        return super().to_internal_value(value)


class PatientSerializer(serializers.ModelSerializer):
    patient_id = serializers.IntegerField(source="id", read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", required=False)
    middle_name = serializers.CharField(
        source="user.middle_name", required=False, allow_blank=True
    )
    last_name = serializers.CharField(source="user.last_name", required=False)
    phone_number = serializers.CharField(
        source="user.phone_number", required=False, allow_blank=True
    )
    role = serializers.CharField(source="user.role", read_only=True)
    full_name = serializers.SerializerMethodField()
    emergency_contact = serializers.CharField(
        source="emergency_contact_name",
        required=False,
        allow_blank=True,
    )
    date_of_birth = NullableDateField(required=False, allow_null=True)

    class Meta:
        model = Patient
        fields = [
            "id",
            "patient_id",
            "user",
            "user_id",
            "user_email",
            "email",
            "first_name",
            "middle_name",
            "last_name",
            "phone_number",
            "role",
            "full_name",
            "national_id",
            "date_of_birth",
            "blood_type",
            "emergency_contact",
            "emergency_contact_name",
            "emergency_contact_phone",
            "address",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "patient_id",
            "user",
            "user_id",
            "created_at",
            "updated_at",
        ]

    def get_full_name(self, obj):
        parts = [obj.user.first_name, obj.user.middle_name, obj.user.last_name]
        return " ".join(part for part in parts if part).strip()

    def validate_national_id(self, value):
        if value in ("", None):
            return None
        if not NATIONAL_ID_RE.match(value):
            raise serializers.ValidationError("National ID must be exactly 14 digits.")
        queryset = Patient.objects.filter(national_id=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError(
                "A patient with this National ID already exists."
            )
        return value

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

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data.pop("user", None)
        return Patient.objects.create(user=user, **validated_data)


class DashboardSerializer(serializers.Serializer):
    total_records = serializers.IntegerField(read_only=True)
    upcoming_appointments = serializers.IntegerField(read_only=True)
    active_consents = serializers.IntegerField(read_only=True)
    pending_payments = serializers.IntegerField(read_only=True)
    recent_notifications = serializers.ListField(read_only=True)


class PatientDashboardSerializer(DashboardSerializer):
    stats = serializers.DictField(read_only=True)
    recent_records = serializers.ListField(read_only=True)
    pending_bills = serializers.ListField(read_only=True)
    recent_activity = serializers.ListField(read_only=True)
    consent = serializers.DictField(read_only=True)
