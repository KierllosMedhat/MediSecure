"""
Appointments Views — Owner: Kyrillos

API views for appointment scheduling, listing, and status management.
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentStatusSerializer


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement AppointmentListCreateView
#   - GET  /api/v1/appointments/ → list appointments
#   - POST /api/v1/appointments/ → create a new appointment
#   - Filter by: patient_id, staff_id, status, appointment_type, date range
#   - Patients see only their own appointments
#   - Staff see appointments assigned to them
#   - Admin sees all appointments
#   - Order by scheduled_at
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────
class AppointmentListCreateView(generics.ListCreateAPIView):
    """List and create appointments."""
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO (Kyrillos): Filter by role, patient_id, staff_id, status, type, dates
        pass

    def perform_create(self, serializer):
        # TODO (Kyrillos): Auto-set patient from request.user if patient role
        # TODO (Kyrillos): Send notification to staff and patient
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement AppointmentDetailView
#   - GET    /api/v1/appointments/<id>/ → retrieve appointment
#   - PUT    /api/v1/appointments/<id>/ → update appointment
#   - DELETE /api/v1/appointments/<id>/ → cancel appointment
#   - On DELETE: set status=CANCELLED (don't hard delete)
#   - Permission: IsAuthenticated + involved party or admin
# ──────────────────────────────────────────────────────
class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or cancel an appointment."""
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO (Kyrillos): Return appointments visible to request.user
        pass

    def perform_destroy(self, instance):
        # TODO (Kyrillos): Set status=CANCELLED instead of deleting
        # TODO (Kyrillos): Send cancellation notification
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement AppointmentStatusView
#   - PATCH /api/v1/appointments/<id>/status/ → update appointment status
#   - Validate status transition rules
#   - Send notifications on status change
#   - Permission: IsAuthenticated + staff or admin
# ──────────────────────────────────────────────────────
class AppointmentStatusView(APIView):
    """Update appointment status (confirm, start, complete, no-show)."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        # TODO (Kyrillos): Validate transition, update status
        # TODO (Kyrillos): If CANCELLED, require cancelled_reason
        # TODO (Kyrillos): Send notification on status change
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement AvailableSlotsView
#   - GET /api/v1/appointments/available-slots/?staff_id=<id>&date=<date>
#   - Return available time slots for a staff member on a given date
#   - Exclude times that conflict with existing appointments
#   - Default slot duration: 30 minutes
#   - Working hours: 08:00–17:00 (configurable)
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────
class AvailableSlotsView(APIView):
    """Get available appointment slots for a staff member."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO (Kyrillos): Get staff_id and date from query params
        # TODO (Kyrillos): Generate time slots for working hours
        # TODO (Kyrillos): Exclude slots that conflict with existing appointments
        # TODO (Kyrillos): Return list of available slot start times
        pass
