"""
Consent Serializers — Owner: Abdullah

Serializers for PDPL consent grant/revoke/list operations.
"""

from rest_framework import serializers
from .models import Consent


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement ConsentSerializer
#   - Fields: id, patient, staff, staff_name, purpose,
#             description, is_active, granted_at, revoked_at, expires_at
#   - Read-only: id, granted_at, revoked_at
#   - Include staff_name as computed field
#   - Validate that patient cannot grant consent to themselves
#   - Validate expires_at is in the future
# ──────────────────────────────────────────────────────
class ConsentSerializer(serializers.ModelSerializer):
    staff_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Consent
        fields = [
            "id", "patient", "patient_name", "staff", "staff_name",
            "purpose", "description", "is_active",
            "granted_at", "revoked_at", "expires_at",
        ]
        read_only_fields = ["id", "granted_at", "revoked_at"]

    def get_staff_name(self, obj):
        # TODO (Abdullah): Return staff user's full name
        pass

    def get_patient_name(self, obj):
        # TODO (Abdullah): Return patient user's full name
        pass

    def validate(self, attrs):
        # TODO (Abdullah): Validate consent rules
        # - Patient cannot grant consent to themselves
        # - expires_at must be in the future if provided
        # - Check for duplicate active consent (same patient+staff+purpose)
        pass


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement ConsentGrantSerializer
#   - Fields: staff, purpose, description, expires_at
#   - Used for POST /consents/ (granting new consent)
#   - Auto-set patient from URL param or request.user
#   - Validate staff exists and is active
# ──────────────────────────────────────────────────────
class ConsentGrantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consent
        fields = ["staff", "purpose", "description", "expires_at"]

    def validate_staff(self, value):
        # TODO (Abdullah): Validate staff exists and is active
        pass

    def create(self, validated_data):
        # TODO (Abdullah): Set patient from context, create consent
        pass


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement ConsentRevokeSerializer
#   - Fields: revocation_reason (optional text)
#   - Used for POST /consents/<id>/revoke/
#   - Set is_active=False and revoked_at=now
# ──────────────────────────────────────────────────────
class ConsentRevokeSerializer(serializers.Serializer):
    revocation_reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        # TODO (Abdullah): Validate consent is currently active
        pass
