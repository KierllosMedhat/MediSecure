"""
Appointments Serializers — Implemented by Kyrillos
"""

from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

from .models import Appointment


# Allowed status transitions
VALID_TRANSITIONS = {
    "SCHEDULED":   {"CONFIRMED", "CANCELLED"},
    "CONFIRMED":   {"IN_PROGRESS", "CANCELLED", "NO_SHOW"},
    "IN_PROGRESS": {"COMPLETED"},
    "COMPLETED":   set(),
    "CANCELLED":   set(),
    "NO_SHOW":     set(),
}


class AppointmentSerializer(serializers.ModelSerializer):
    """Full serializer for appointment creation and display."""

    patient_name = serializers.SerializerMethodField()
    staff_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            "id", "patient", "patient_name", "staff", "staff_name",
            "scheduled_at", "duration_min", "status", "appointment_type",
            "location", "notes", "cancelled_reason",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at"]

    def get_patient_name(self, obj):
        u = obj.patient.user
        parts = [u.first_name, u.middle_name, u.last_name]
        return " ".join(p for p in parts if p).strip() or u.email

    def get_staff_name(self, obj):
        u = obj.staff.user
        parts = [u.first_name, u.middle_name, u.last_name]
        return " ".join(p for p in parts if p).strip() or u.email

    def validate_scheduled_at(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError(
                "Scheduled time must be in the future."
            )
        return value

    def validate(self, attrs):
        staff = attrs.get("staff")
        scheduled_at = attrs.get("scheduled_at")
        duration_min = attrs.get("duration_min", 30)

        if staff and scheduled_at:
            end_time = scheduled_at + timedelta(minutes=duration_min)

            # Exclude current instance on update
            qs = Appointment.objects.filter(
                staff=staff,
            ).exclude(
                status__in=["CANCELLED", "NO_SHOW"]
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)

            # Check for overlapping appointments
            # Existing appointment [ex_start, ex_end) overlaps [scheduled_at, end_time)
            # if ex_start < end_time AND ex_end > scheduled_at
            for existing in qs.filter(
                scheduled_at__lt=end_time,
            ):
                existing_end = existing.scheduled_at + timedelta(
                    minutes=existing.duration_min
                )
                if existing_end > scheduled_at:
                    raise serializers.ValidationError(
                        f"This staff member already has an appointment from "
                        f"{existing.scheduled_at.strftime('%H:%M')} to "
                        f"{existing_end.strftime('%H:%M')} on that day."
                    )

        return attrs


class AppointmentStatusSerializer(serializers.Serializer):
    """Serializer for updating appointment status (transition validation)."""

    status = serializers.ChoiceField(choices=Appointment.Status.choices)
    cancelled_reason = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        new_status = attrs["status"]
        current_status = self.context.get("current_status")

        if current_status:
            allowed = VALID_TRANSITIONS.get(current_status, set())
            if new_status not in allowed:
                raise serializers.ValidationError(
                    f"Cannot transition from '{current_status}' to '{new_status}'. "
                    f"Allowed transitions: {sorted(allowed) or 'none'}."
                )

        # Require a reason when cancelling
        if new_status == "CANCELLED" and not attrs.get("cancelled_reason", "").strip():
            raise serializers.ValidationError(
                {"cancelled_reason": "A reason is required when cancelling an appointment."}
            )

        return attrs
