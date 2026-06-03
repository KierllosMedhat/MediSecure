"""
Patients API views for profile, listing, detail, and dashboard statistics.
"""

from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsPatient, IsStaff

from .models import Patient
from .serializers import PatientDashboardSerializer, PatientSerializer


class PatientProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve and update the authenticated patient's profile."""

    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated, IsPatient]

    def get_object(self):
        patient, _ = Patient.objects.select_related("user").get_or_create(
            user=self.request.user
        )
        return patient


class PatientListView(generics.ListAPIView):
    """List all patients for staff/admin users."""

    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated, IsStaff]
    queryset = Patient.objects.select_related("user").all()
    filterset_fields = ["blood_type"]
    search_fields = [
        "national_id",
        "user__email",
        "user__first_name",
        "user__middle_name",
        "user__last_name",
    ]
    ordering_fields = ["created_at", "updated_at", "date_of_birth"]
    ordering = ["-created_at"]


class PatientDetailView(generics.RetrieveAPIView):
    """Retrieve a patient profile. Staff see all; patients see only themselves."""

    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Patient.objects.select_related("user")
        if self.request.user.role in IsStaff.STAFF_ROLES:
            return queryset
        return queryset.filter(user=self.request.user)


class PatientDashboardView(generics.GenericAPIView):
    """Dashboard statistics for the authenticated patient."""

    serializer_class = PatientDashboardSerializer
    permission_classes = [IsAuthenticated, IsPatient]

    def get(self, request, *args, **kwargs):
        patient, _ = Patient.objects.select_related("user").get_or_create(
            user=request.user
        )
        now = timezone.now()

        records = patient.medical_records.select_related("created_by")
        upcoming_appointments = patient.appointments.filter(
            scheduled_at__gte=now,
            status__in=["SCHEDULED", "CONFIRMED"],
        )
        active_consents = patient.consents.filter(is_active=True).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=now)
        )
        pending_payments = patient.payments.filter(status__in=["PENDING", "PROCESSING"])
        unread_notifications = request.user.notifications.filter(
            is_read=False
        ).order_by("-sent_at")[:5]

        pending_amount = pending_payments.aggregate(total=Sum("amount"))["total"] or 0
        next_appointment = (
            upcoming_appointments.select_related("staff__user")
            .order_by("scheduled_at")
            .first()
        )

        data = {
            "total_records": records.count(),
            "upcoming_appointments": upcoming_appointments.count(),
            "active_consents": active_consents.count(),
            "pending_payments": pending_payments.count(),
            "recent_notifications": [
                {
                    "id": notification.id,
                    "subject": notification.subject,
                    "content": notification.content,
                    "type": notification.notification_type,
                    "sent_at": notification.sent_at,
                }
                for notification in unread_notifications
            ],
            "stats": {
                "total_records": records.count(),
                "pending_bills_amount": pending_amount,
                "next_appointment": self._serialize_next_appointment(next_appointment),
                "profile_completion": self._profile_completion(patient),
            },
            "recent_records": [
                {
                    "id": record.id,
                    "title": record.title,
                    "doctor_name": self._user_name(record.created_by),
                    "date": record.created_at.date(),
                    "type": record.record_type,
                }
                for record in records.order_by("-created_at")[:5]
            ],
            "pending_bills": [
                {
                    "id": payment.id,
                    "description": payment.description or payment.payment_type,
                    "due_date": payment.created_at.date(),
                    "amount": payment.amount,
                    "status": payment.status,
                }
                for payment in pending_payments.order_by("-created_at")[:5]
            ],
            "recent_activity": [
                {
                    "id": notification.id,
                    "action": notification.subject,
                    "description": notification.content,
                    "timestamp": notification.sent_at,
                    "type": notification.notification_type.lower(),
                }
                for notification in unread_notifications
            ],
            "consent": {"grant_data_access": active_consents.exists()},
        }

        serializer = self.get_serializer(data)
        return Response(serializer.data)

    def _serialize_next_appointment(self, appointment):
        if not appointment:
            return None
        return {
            "date": appointment.scheduled_at.date(),
            "doctor_name": self._user_name(appointment.staff.user),
        }

    def _profile_completion(self, patient):
        fields = [
            patient.user.first_name,
            patient.user.last_name,
            patient.user.email,
            patient.user.phone_number,
            patient.national_id,
            patient.date_of_birth,
            patient.blood_type,
            patient.emergency_contact_name,
            patient.emergency_contact_phone,
            patient.address,
        ]
        completed = sum(1 for value in fields if value)
        return round((completed / len(fields)) * 100)

    def _user_name(self, user):
        if not user:
            return ""
        name = " ".join(
            part for part in [user.first_name, user.last_name] if part
        ).strip()
        return name or user.email
