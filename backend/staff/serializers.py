"""
Staff Serializers — Owner: Kyrillos

Serializers for staff CRUD and dashboard statistics.
"""

from rest_framework import serializers
from .models import Staff


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement StaffListSerializer
#   - Fields: id, user (nested: id, email, first_name, last_name, role),
#             hospital_name, department, license_no, is_active, hired_at
#   - Used for list views (lightweight)
#   - Include hospital_name as computed field
# ──────────────────────────────────────────────────────
class StaffListSerializer(serializers.ModelSerializer):
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
        # TODO (Kyrillos): Return user's full name
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement StaffDetailSerializer
#   - All Staff fields + nested user data + appointment count
#   - Include address, created_at, updated_at
#   - Include upcoming_appointments count
#   - Used for detail/edit views
# ──────────────────────────────────────────────────────
class StaffDetailSerializer(serializers.ModelSerializer):
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
        # TODO (Kyrillos): Return user's full name
        pass

    def get_upcoming_appointments(self, obj):
        # TODO (Kyrillos): Count future appointments for this staff member
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement StaffCreateSerializer
#   - Fields for creating a new staff member:
#     - User fields: email, password, first_name, last_name, role
#     - Staff fields: hospital, department, license_no, address
#   - Create both User and Staff in a single transaction
#   - Validate role is a staff role (not PATIENT)
#   - Validate license_no is provided for DOCTOR role
# ──────────────────────────────────────────────────────
class StaffCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=["DOCTOR", "NURSE", "BILLING_STAFF", "ADMIN"],
        write_only=True,
    )

    class Meta:
        model = Staff
        fields = [
            "email", "password", "first_name", "last_name", "role",
            "hospital", "department", "license_no", "address",
        ]

    def validate(self, attrs):
        # TODO (Kyrillos): Validate license_no required for DOCTOR
        # TODO (Kyrillos): Validate email uniqueness
        pass

    def create(self, validated_data):
        # TODO (Kyrillos): Extract user fields, create User, then create Staff
        # TODO (Kyrillos): Use transaction.atomic() for safety
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement StaffDashboardSerializer
#   - Aggregate dashboard stats for the staff member:
#     - total_patients: count of unique patients
#     - today_appointments: count of today's appointments
#     - pending_consents: count of pending consent requests
#     - recent_records: last 5 medical records they created
# ──────────────────────────────────────────────────────
class StaffDashboardSerializer(serializers.Serializer):
    total_patients = serializers.IntegerField(read_only=True)
    today_appointments = serializers.IntegerField(read_only=True)
    pending_consents = serializers.IntegerField(read_only=True)
    recent_records = serializers.ListField(read_only=True)
