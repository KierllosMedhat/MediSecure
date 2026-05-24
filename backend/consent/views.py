"""
Consent Views — Owner: Abdullah

API views aligned to frontend consentService.js:
  GET    /patients/<id>/consents           → ConsentListView    (getConsents)
  POST   /patients/<id>/consents           → ConsentGrantView   (grantConsent)
  DELETE /patients/<id>/consents/<cid>     → ConsentRevokeView  (revokeConsent)

Admin/utility:
  GET    /consents/check                   → ConsentCheckView
  GET    /consents/<id>                    → ConsentDetailView
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

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
class ConsentListView(generics.ListAPIView):
    """List consents for a specific patient."""
    serializer_class = ConsentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        patient_id = self.kwargs.get("patient_id")
        # TODO (Abdullah): Return Consent.objects.filter(patient_id=patient_id)
        # TODO (Abdullah): Enforce that request.user owns this patient OR is staff
        # TODO (Abdullah): Optional filter: ?is_active=true/false
        pass


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
class ConsentGrantView(generics.CreateAPIView):
    """Grant a new consent (patient-scoped)."""
    serializer_class = ConsentGrantSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        patient_id = self.kwargs.get("patient_id")
        # TODO (Abdullah): Validate request.user is the patient with patient_id
        # TODO (Abdullah): Set patient from patient_id in URL
        # TODO (Abdullah): Log consent grant in audit log
        pass


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
        # TODO (Abdullah): Get consent by pk AND patient_id (both must match)
        # TODO (Abdullah): Validate request.user owns this patient profile
        # TODO (Abdullah): Validate consent is currently active
        # TODO (Abdullah): Set is_active=False, revoked_at=timezone.now()
        # TODO (Abdullah): Log revocation in audit log
        # TODO (Abdullah): Return 200 {"message": "Consent revoked", "revoked_at": "..."}
        pass


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
        # TODO (Abdullah): Return Consent.objects.all() with permission filtering
        pass


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
        # TODO (Abdullah): Read patient_id, staff_id, purpose from query params
        # TODO (Abdullah): Query active consents, return {"has_consent": bool, "consent_id": id|None}
        pass
