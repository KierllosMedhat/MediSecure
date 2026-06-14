"""
Consent Views — Owner: Abdullah

API views aligned to frontend consentService.js:
  GET    /patients/<id>/consents           -> ConsentListView    (getConsents)
  POST   /patients/<id>/consents           -> ConsentGrantView   (grantConsent)
  DELETE /patients/<id>/consents/<cid>     -> ConsentRevokeView  (revokeConsent)

Admin/utility:
  GET    /consents/check                   -> ConsentCheckView
  GET    /consents/<id>                    -> ConsentDetailView
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.apps import apps

from .models import Consent
from .serializers import (
    ConsentSerializer,
    ConsentGrantSerializer,
    ConsentRevokeSerializer,
)


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement ConsentListView
#   - GET /api/v1/patients/<patient_id>/consents
#   - Frontend: getConsents(patientId)
#   - Returns all consents for the given patient
#   - patient_id comes from the URL kwarg (set in root urls.py)
#   - Enforce: requesting user must be the patient OR a staff member
#   - Filter active/inactive via ?is_active=true
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────



# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement ConsentGrantView
#   - POST /api/v1/patients/<patient_id>/consents
#   - Frontend: grantConsent(patientId, { staff_id, purpose })
#   - patient_id comes from URL, staff_id + purpose from body
#   - Enforce: only the patient themselves can grant consent
#   - Validate no duplicate active consent (same patient+staff+purpose)
#   - Log the grant in audit log
#   - Permission: IsAuthenticated + IsPatient (must be the patient)
# ──────────────────────────────────────────────────────


class ConsentListGrantView(generics.ListCreateAPIView):
    """List consents (GET) or grant a new one (POST) for a specific patient."""
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ConsentGrantSerializer
        return ConsentSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        patient_id = self.kwargs.get("patient_id")
        Patient = apps.get_model('patients', 'Patient')
        
        # Handle 'me' translation
        if str(patient_id).lower() == "me":
            patient = get_object_or_404(Patient, user=self.request.user)
        else:
            patient = get_object_or_404(Patient, id=patient_id)
            
        context['patient'] = patient
        return context

    def get_queryset(self):
        patient_id = self.kwargs.get("patient_id")
        Patient = apps.get_model('patients', 'Patient')
        
        # Handle 'me' translation
        if str(patient_id).lower() == "me":
            patient = get_object_or_404(Patient, user=self.request.user)
        else:
            patient = get_object_or_404(Patient, id=patient_id)

        is_owner = getattr(patient, 'user', None) == self.request.user
        is_staff = getattr(self.request.user, 'is_staff', False)
        
        if not (is_owner or is_staff):
            raise PermissionDenied("You do not have permission to view these consent records.")

        queryset = Consent.objects.filter(patient=patient)

        is_active_param = self.request.query_params.get("is_active")
        if is_active_param is not None:
            is_active_bool = is_active_param.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)

        return queryset

    
    def perform_create(self, serializer):
        patient = serializer.context.get('patient')

        if getattr(patient, 'user', None) != self.request.user:
            raise PermissionDenied("You can only grant consent for your own records.")

        consent = serializer.save()
        # TODO (Kyrillos - Audit): Log consent grant in audit log


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement ConsentRevokeView
#   - DELETE /api/v1/patients/<patient_id>/consents/<pk>
#   - Frontend: revokeConsent(patientId, consentId)
#   - Sets is_active=False, revoked_at=now()  (does NOT hard-delete)
#   - Only the patient who granted it can revoke
#   - Log the revocation in audit log
#   - Returns 200 with {"message": "Consent revoked", "revoked_at": "..."}
#   - Permission: IsAuthenticated + IsPatient (must be the patient)
# ──────────────────────────────────────────────────────
class ConsentRevokeView(APIView):
    """Revoke an active consent (soft-delete, patient-scoped)."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, patient_id, pk):
        # Handle 'me' translation
        if str(patient_id).lower() == "me":
            Patient = apps.get_model('patients', 'Patient')
            patient = get_object_or_404(Patient, user=request.user)
            actual_patient_id = patient.id
        else:
            actual_patient_id = patient_id

        # Get consent by pk AND actual_patient_id (both must match)
        consent = get_object_or_404(Consent, pk=pk, patient_id=actual_patient_id)

        # Validate request.user owns this patient profile
        if getattr(consent.patient, 'user', None) != request.user:
            raise PermissionDenied("You can only revoke your own consents.")

        # Trigger validation and soft-delete via Serializer
        serializer = ConsentRevokeSerializer(consent, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # TODO (Kyrillos - Audit): Log revocation in audit log
        # audit_utils.log_action(user=request.user, action="CONSENT_REVOKED", target=consent.id)

        return Response({
            "message": "Consent revoked",
            "revoked_at": consent.revoked_at
        }, status=status.HTTP_200_OK)


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement ConsentDetailView
#   - GET /api/v1/consents/<id>
#   - Admin/staff utility to inspect a specific consent
#   - Permission: IsAuthenticated + IsStaffMember or IsAdmin
# ──────────────────────────────────────────────────────
class ConsentDetailView(generics.RetrieveAPIView):
    """Retrieve a specific consent record (admin/staff)."""
    serializer_class = ConsentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return Consent.objects.all() with permission filtering
        if getattr(self.request.user, 'is_staff', False):
            return Consent.objects.all()
        raise PermissionDenied("Only staff members can access detailed consent records.")


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement ConsentCheckView
#   - GET /api/v1/consents/check?patient_id=<id>&staff_id=<id>&purpose=<purpose>
#   - Quick check: does an active consent exist for this combination?
#   - Return {"has_consent": true/false, "consent_id": <id>|null}
#   - Used by other services before accessing patient data
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────
class ConsentCheckView(APIView):
    """Check if an active consent exists for a patient-staff-purpose combo."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Read patient_id, staff_id, purpose from query params
        patient_id = request.query_params.get("patient_id")
        staff_id = request.query_params.get("staff_id")
        purpose = request.query_params.get("purpose")

        if not all([patient_id, staff_id, purpose]):
            return Response(
                {"error": "Missing required parameters: patient_id, staff_id, purpose"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Query active consents
        consent = Consent.objects.filter(
            patient_id=patient_id,
            staff_id=staff_id,
            purpose=purpose,
            is_active=True
        ).first()

        if consent:
            return Response({
                "has_consent": True,
                "consent_id": consent.id
            }, status=status.HTTP_200_OK)
            
        return Response({
            "has_consent": False,
            "consent_id": None
        }, status=status.HTTP_200_OK)