"""
Consent Serializers — Owner: Abdullah

Serializers for PDPL consent grant/revoke/list operations.
"""

from rest_framework import serializers
from .models import Consent
from django.utils import timezone


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
        read_only_fields = ["id", "granted_at", "revoked_at", "is_active"]

    def get_staff_name(self, obj):
        try:
            return f"{obj.staff.user.first_name} {obj.staff.user.last_name}".strip()
        except AttributeError:
            return f"Staff #{obj.staff_id}"

    def get_patient_name(self, obj):
        try:
            return f"{obj.patient.user.first_name} {obj.patient.user.last_name}".strip()
        except AttributeError:
            return f"Patient #{obj.patient_id}"

    def validate(self, attrs):
        # Validate expires_at is in the future
        expires_at = attrs.get('expires_at')
        if expires_at and expires_at <= timezone.now():
            raise serializers.ValidationError({
                "expires_at": "The expiration date must be in the future."
            })

        patient = attrs.get('patient') or (self.instance.patient if self.instance else None)
        staff = attrs.get('staff') or (self.instance.staff if self.instance else None)

        # Validate that patient cannot grant consent to themselves
        if patient and staff and hasattr(patient, 'user') and hasattr(staff, 'user'):
            if patient.user == staff.user:
                raise serializers.ValidationError(
                    "PDPL Violation: Patients cannot grant consent to themselves."
                )

        # Check for duplicate active consent (same patient+staff+purpose)
        purpose = attrs.get('purpose') or (self.instance.purpose if self.instance else None)
        if patient and staff and purpose:
            qs = Consent.objects.filter(
                patient=patient,
                staff=staff,
                purpose=purpose,
                is_active=True
            )
            # Exclude current instance if updating
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            
            if qs.exists():
                raise serializers.ValidationError(
                    "An active consent for this staff member and purpose already exists."
                )

        return attrs


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
        # Validate staff exists and is active
        if hasattr(value, 'is_active') and not value.is_active:
            raise serializers.ValidationError("The selected staff member is inactive.")
        if hasattr(value, 'user') and not value.user.is_active:
            raise serializers.ValidationError("The user account for this staff member is inactive.")
        return value

    def validate(self, attrs):
        expires_at = attrs.get('expires_at')
        if expires_at and expires_at <= timezone.now():
            raise serializers.ValidationError({
                "expires_at": "The expiration date must be in the future."
            })
        return attrs

    def create(self, validated_data):
        # Retrieve patient from the serializer context (passed from the view)
        patient = self.context.get("patient")
        if not patient:
            raise serializers.ValidationError("Patient context is missing. Cannot grant consent.")

        validated_data['patient'] = patient

        # Duplicate active consent check for safety
        if Consent.objects.filter(
            patient=patient,
            staff=validated_data['staff'],
            purpose=validated_data['purpose'],
            is_active=True
        ).exists():
            raise serializers.ValidationError(
                "An active consent for this staff member and purpose already exists."
            )

        return super().create(validated_data)


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement ConsentRevokeSerializer
#   - Fields: revocation_reason (optional text)
#   - Used for POST /consents/<id>/revoke/
#   - Set is_active=False and revoked_at=now
# ──────────────────────────────────────────────────────
class ConsentRevokeSerializer(serializers.Serializer):
    revocation_reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        # Validate consent is currently active
        if not self.instance.is_active:
            raise serializers.ValidationError("This consent is already inactive or revoked.")
        return attrs

    def save(self, **kwargs):
        # Soft delete the consent using the model's revoke method
        self.instance.revoke()
        
        return self.instance