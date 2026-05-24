"""
Appointments Serializers — Owner: Kyrillos

Serializers for appointment scheduling and management.
"""

from rest_framework import serializers
from .models import Appointment


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement AppointmentSerializer
#   - Fields: id, patient, patient_name, staff, staff_name,
#             scheduled_at, duration_min, status, appointment_type,
#             location, notes, created_at, updated_at
#   - Computed: patient_name, staff_name
#   - Read-only: id, created_at, updated_at
#   - Validate scheduled_at is in the future (for creation)
#   - Validate no time conflict with staff's other appointments
# ──────────────────────────────────────────────────────
class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    staff_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            "id", "patient", "patient_name", "staff", "staff_name",
            "scheduled_at", "duration_min", "status", "appointment_type",
            "location", "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_patient_name(self, obj):
        # TODO (Kyrillos): Return patient's full name
        pass

    def get_staff_name(self, obj):
        # TODO (Kyrillos): Return staff member's full name
        pass

    def validate_scheduled_at(self, value):
        # TODO (Kyrillos): Validate scheduled_at is in the future
        pass

    def validate(self, attrs):
        # TODO (Kyrillos): Check for scheduling conflicts
        # - Query existing appointments for the same staff member
        # - Check if the time range overlaps with any existing appointment
        # - Exclude cancelled/no_show appointments from conflict check
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement AppointmentStatusSerializer
#   - Fields: status, cancelled_reason (if cancelling)
#   - Used for PATCH /appointments/<id>/status/
#   - Validate status transitions (e.g., can't go from COMPLETED to SCHEDULED)
# ──────────────────────────────────────────────────────
class AppointmentStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Appointment.Status.choices)
    cancelled_reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        # TODO (Kyrillos): Validate status transition is allowed
        # Valid transitions:
        #   SCHEDULED → CONFIRMED, CANCELLED
        #   CONFIRMED → IN_PROGRESS, CANCELLED, NO_SHOW
        #   IN_PROGRESS → COMPLETED
        pass
