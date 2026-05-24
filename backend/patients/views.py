"""
Patients Views — Owner: Abanob

API views for patient profile CRUD and dashboard statistics.
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsPatient, IsOwnerOrAdmin, IsAdmin

from .models import Patient
from .serializers import PatientSerializer, PatientDashboardSerializer


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement PatientProfileView
#   - GET  /api/v1/patients/profile/ → return current patient's profile
#   - PUT  /api/v1/patients/profile/ → update patient profile
#   - PATCH /api/v1/patients/profile/ → partial update
#   - Auto-link to request.user's patient profile
#   - Create patient profile if it doesn't exist (on first access)
#   - Permission: IsAuthenticated + IsPatient
# ──────────────────────────────────────────────────────
class PatientProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve and update the authenticated patient's profile."""
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # TODO (Abanob): Get or create patient profile for request.user
        pass


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement PatientListView
#   - GET /api/v1/patients/ → list all patients (admin/staff only)
#   - Support filtering by blood_type, search by name/national_id
#   - Permission: IsAuthenticated + IsStaffMember
# ──────────────────────────────────────────────────────
class PatientListView(generics.ListAPIView):
    """List all patients — staff/admin only."""
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO (Abanob): Return Patient.objects.all() with select_related("user")
        # TODO (Abanob): Add filtering by blood_type and search by name
        pass


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement PatientDetailView
#   - GET /api/v1/patients/<id>/ → retrieve patient detail
#   - Permission: IsAuthenticated + (IsOwnerOrAdmin | IsStaffMember)
# ──────────────────────────────────────────────────────
class PatientDetailView(generics.RetrieveAPIView):
    """Retrieve a specific patient's profile."""
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO (Abanob): Return queryset with proper permission filtering
        pass


# ──────────────────────────────────────────────────────
# TODO (Abanob): Implement PatientDashboardView
#   - GET /api/v1/patients/dashboard/ → return dashboard stats
#   - Aggregate data from records, appointments, consents, payments
#   - Permission: IsAuthenticated + IsPatient
# ──────────────────────────────────────────────────────
class PatientDashboardView(APIView):
    """Dashboard statistics for the authenticated patient."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO (Abanob): Query related models and aggregate stats
        # - Count medical records
        # - Count upcoming appointments
        # - Count active consents
        # - Count pending payments
        # - Get last 5 unread notifications
        pass
