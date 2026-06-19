"""
Staff Views — Implemented by Kyrillos
"""

from django.utils import timezone

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.permissions import IsAdmin, IsStaffMember

from .models import Staff
from .serializers import (
    StaffListSerializer,
    StaffDetailSerializer,
    StaffCreateSerializer,
    StaffDashboardSerializer,
    StaffProfileSerializer,
)


class StaffListCreateView(generics.ListCreateAPIView):
    """
    GET  /staff  — List all staff members (any authenticated staff).
    POST /staff  — Create a new staff member (admin only).
    """
    permission_classes = [IsAuthenticated, IsStaffMember]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["department", "hospital", "is_active"]
    search_fields = [
        "user__first_name", "user__last_name",
        "user__email", "license_no",
    ]
    ordering_fields = ["hired_at", "department", "user__last_name"]
    ordering = ["user__last_name"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return StaffCreateSerializer
        return StaffListSerializer

    def get_queryset(self):
        qs = Staff.objects.select_related("user", "hospital").all()
        # Filter by role via query param (?role=DOCTOR)
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(user__role=role)
        return qs

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]


class StaffDetailView(generics.RetrieveUpdateAPIView):
    """
    GET  /staff/<id>  — Retrieve staff detail (any staff member).
    PUT  /staff/<id>  — Update staff profile (admin only).
    """
    serializer_class = StaffDetailSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get_queryset(self):
        return Staff.objects.select_related("user", "hospital").all()

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated(), IsStaffMember()]


class StaffDeactivateView(APIView):
    """
    PATCH /staff/<id>/deactivate  — Soft-delete a staff member (admin only).
    Sets is_active=False on both Staff and User records.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        try:
            staff = Staff.objects.select_related("user").get(pk=pk)
        except Staff.DoesNotExist:
            return Response(
                {"detail": "Staff member not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not staff.is_active:
            return Response(
                {"detail": "Staff member is already deactivated."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Soft-delete both records
        staff.is_active = False
        staff.save(update_fields=["is_active", "updated_at"])

        staff.user.is_active = False
        staff.user.save(update_fields=["is_active"])

        return Response(
            {"message": "Staff member deactivated successfully."},
            status=status.HTTP_200_OK,
        )


class StaffDashboardView(APIView):
    """
    GET /staff/dashboard  — Dashboard statistics for the authenticated staff member.
    """
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get(self, request):
        today = timezone.now().date()
        from patients.models import Patient
        total_patients = Patient.objects.count()

        if getattr(request.user, 'role', '') in ["ADMIN", "BILLING_STAFF"]:
            from records.models import MedicalRecord
            recent_records = list(
                MedicalRecord.objects.all().order_by("-created_at").values("id", "title", "record_type", "created_at")[:5]
            )
            for rec in recent_records:
                rec["created_at"] = rec["created_at"].isoformat()

            from appointments.models import Appointment
            upcoming_appointments_qs = Appointment.objects.filter(
                scheduled_at__gte=timezone.now(),
            ).exclude(
                status__in=["CANCELLED", "NO_SHOW"]
            ).order_by("scheduled_at").select_related("patient__user")[:5]

            upcoming_appointments = [
                {
                    "id": appt.id,
                    "date": appt.scheduled_at.isoformat(),
                    "patient_name": f"{appt.patient.user.first_name} {appt.patient.user.last_name}".strip() or appt.patient.user.email,
                    "status": appt.status,
                    "type": appt.appointment_type,
                }
                for appt in upcoming_appointments_qs
            ]

            return Response({
                "total_patients": total_patients,
                "today_appointments": Appointment.objects.filter(scheduled_at__date=today).exclude(status__in=["CANCELLED", "NO_SHOW"]).count(),
                "pending_consents": 0,
                "recent_records": recent_records,
                "upcoming_appointments": upcoming_appointments,
            })

        try:
            staff = Staff.objects.get(user=request.user)
        except Staff.DoesNotExist:
            # Fallback for staff members without a profile (e.g., brand new doctors)
            return Response({
                "total_patients": total_patients,
                "today_appointments": 0,
                "pending_consents": 0,
                "recent_records": [],
                "upcoming_appointments": [],
            })

        # Count today's non-cancelled appointments
        today_appointments = staff.appointments.filter(
            scheduled_at__date=today,
        ).exclude(
            status__in=["CANCELLED", "NO_SHOW"]
        ).count()

        # Count pending consents requested by this staff member
        pending_consents = staff.consent_grants.filter(status="PENDING").count()

        # Last 5 medical records created by this staff member
        from records.models import MedicalRecord
        recent_records = list(
            MedicalRecord.objects.filter(created_by=request.user)
            .order_by("-created_at")
            .values("id", "title", "record_type", "created_at")[:5]
        )

        # Convert datetimes to strings for JSON serialisation
        for rec in recent_records:
            rec["created_at"] = rec["created_at"].isoformat()

        # Get next 5 upcoming appointments
        upcoming_appointments_qs = staff.appointments.filter(
            scheduled_at__gte=timezone.now(),
        ).exclude(
            status__in=["CANCELLED", "NO_SHOW"]
        ).order_by("scheduled_at").select_related("patient__user")[:5]

        upcoming_appointments = [
            {
                "id": appt.id,
                "date": appt.scheduled_at.isoformat(),
                "patient_name": f"{appt.patient.user.first_name} {appt.patient.user.last_name}".strip() or appt.patient.user.email,
                "status": appt.status,
                "type": appt.appointment_type,
            }
            for appt in upcoming_appointments_qs
        ]

        data = {
            "total_patients": total_patients,
            "today_appointments": today_appointments,
            "pending_consents": pending_consents,
            "recent_records": recent_records,
            "upcoming_appointments": upcoming_appointments,
        }

        serializer = StaffDashboardSerializer(data)
        return Response(serializer.data)

class StaffProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve and update the authenticated staff member's profile."""
    serializer_class = StaffProfileSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get_object(self):
        try:
            return self.request.user.staff_profile
        except Staff.DoesNotExist:
            from django.http import Http404
            raise Http404("Staff profile not found.")

