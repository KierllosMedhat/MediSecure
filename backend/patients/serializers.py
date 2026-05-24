"""
Patients Serializers — Owner: Abanob

Serializers for patient profile CRUD and dashboard statistics.
"""

from rest_framework import serializers
from .models import Patient


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement PatientSerializer
#   - Include all patient fields + nested user info (name, email)
#   - Read-only: id, user email, created_at, updated_at
#   - Validate national_id format (Egyptian National ID: 14 digits)
#   - Handle creating patient profile linked to request.user
# ──────────────────────────────────────────────────────
class PatientSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [
            "id", "user", "user_email", "full_name",
            "national_id", "date_of_birth", "blood_type",
            "emergency_contact_name", "emergency_contact_phone",
            "address", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def get_full_name(self, obj):
        # TODO (Abanob): Return formatted full name from user
        pass

    def validate_national_id(self, value):
        # TODO (Abanob): Validate Egyptian National ID format
        pass


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement PatientDashboardSerializer
#   - Aggregate dashboard statistics for the patient:
#     - total_records: count of medical records
#     - upcoming_appointments: count of future appointments
#     - active_consents: count of active consent grants
#     - pending_payments: count of unpaid payments
#     - recent_notifications: last 5 unread notifications
# ──────────────────────────────────────────────────────
class PatientDashboardSerializer(serializers.Serializer):
    total_records = serializers.IntegerField(read_only=True)
    upcoming_appointments = serializers.IntegerField(read_only=True)
    active_consents = serializers.IntegerField(read_only=True)
    pending_payments = serializers.IntegerField(read_only=True)
    recent_notifications = serializers.ListField(read_only=True)
