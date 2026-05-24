"""
Staff Views — Owner: Kyrillos

API views for staff CRUD and dashboard.

Views are aligned to frontend staffService.js:
  GET/POST  /staff              → StaffListCreateView
  GET/PUT   /staff/<id>         → StaffDetailView
  PATCH     /staff/<id>/deactivate → StaffDeactivateView
  GET       /staff/dashboard    → StaffDashboardView
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsAdmin, IsStaffMember

from .models import Staff
from .serializers import (
    StaffListSerializer,
    StaffDetailSerializer,
    StaffCreateSerializer,
    StaffDashboardSerializer,
)


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement StaffListCreateView
#   - GET  /api/v1/staff   → list all staff members
#   - POST /api/v1/staff   → create a new staff member
#   - Frontend GET params: { role, department, status, hospital_id }
#   - Frontend POST body:  { email, first_name, middle_name, last_name,
#                            phone_number, role, hospital_id, department,
#                            license_no, address }
#   - Filter by: department, hospital, role, is_active
#   - Search by: name, email, license_no
#   - GET permission: IsAuthenticated + IsStaffMember
#   - POST permission: IsAuthenticated + IsAdmin
# ──────────────────────────────────────────────────────
class StaffListCreateView(generics.ListCreateAPIView):
    """List staff (GET) and create new staff member (POST)."""
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return StaffCreateSerializer
        return StaffListSerializer

    def get_queryset(self):
        # TODO (Kyrillos): Return Staff.objects with select_related("user", "hospital")
        # TODO (Kyrillos): Filter by role, department, hospital_id, is_active from query params
        pass

    def perform_create(self, serializer):
        # TODO (Kyrillos): Create user + staff atomically, send welcome email
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement StaffDetailView
#   - GET    /api/v1/staff/<id>  → retrieve staff detail (getStaffById)
#   - PUT    /api/v1/staff/<id>  → update staff (updateStaff)
#   - Permission: GET = IsStaffMember, PUT = IsAdmin
# ──────────────────────────────────────────────────────
class StaffDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update a staff member."""
    serializer_class = StaffDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO (Kyrillos): Return Staff with select_related
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement StaffDeactivateView
#   - PATCH /api/v1/staff/<id>/deactivate → soft-delete staff
#   - Frontend: deactivateStaff(staffId) → PATCH /staff/<id>/deactivate
#   - Sets is_active=False on Staff AND is_active=False on User
#   - Returns 200 with updated staff data
#   - Permission: IsAuthenticated + IsAdmin
# ──────────────────────────────────────────────────────
class StaffDeactivateView(APIView):
    """Deactivate (soft-delete) a staff member."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        # TODO (Kyrillos): Get Staff by pk, set is_active=False on staff + user
        # TODO (Kyrillos): Return Response with updated serializer data
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement StaffDashboardView
#   - GET /api/v1/staff/dashboard → dashboard stats for current staff
#   - Aggregate: total_patients, today_appointments,
#                pending_consents, recent_records
#   - Permission: IsAuthenticated + IsStaffMember
# ──────────────────────────────────────────────────────
class StaffDashboardView(APIView):
    """Dashboard statistics for the authenticated staff member."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO (Kyrillos): Get staff profile from request.user
        # TODO (Kyrillos): Aggregate stats from related models
        pass
