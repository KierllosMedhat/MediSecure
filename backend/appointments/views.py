"""
Appointments Views — Implemented by Kyrillos
"""

from datetime import datetime, timedelta, time

from django.utils import timezone
from django.db.models import Q

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.permissions import IsStaffMember

from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentStatusSerializer


class AppointmentListCreateView(generics.ListCreateAPIView):
    """
    GET  /appointments  — List appointments (role-filtered).
    POST /appointments  — Create a new appointment.
    """
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "appointment_type"]
    search_fields = [
        "patient__user__first_name", "patient__user__last_name",
        "staff__user__first_name", "notes",
    ]
    ordering_fields = ["scheduled_at", "status"]
    ordering = ["scheduled_at"]

    def get_queryset(self):
        user = self.request.user
        qs = Appointment.objects.select_related(
            "patient__user", "staff__user"
        )

        # Role-based filtering
        if user.role == "PATIENT":
            try:
                qs = qs.filter(patient=user.patient_profile)
            except Exception:
                return Appointment.objects.none()
        elif user.role in ("DOCTOR", "NURSE"):
            try:
                qs = qs.filter(staff=user.staff_profile)
            except Exception:
                return Appointment.objects.none()
        # ADMIN and BILLING_STAFF see all appointments

        # Optional query param filters
        patient_id = self.request.query_params.get("patient_id")
        staff_id = self.request.query_params.get("staff_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        if staff_id:
            qs = qs.filter(staff_id=staff_id)
        if from_date:
            qs = qs.filter(scheduled_at__date__gte=from_date)
        if to_date:
            qs = qs.filter(scheduled_at__date__lte=to_date)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        # If the requester is a patient, auto-set patient from their profile
        if user.role == "PATIENT":
            appointment = serializer.save(
                patient=user.patient_profile,
                status=Appointment.Status.SCHEDULED,
            )
        else:
            appointment = serializer.save(status=Appointment.Status.SCHEDULED)

        from notifications.services import create_notification
        from notifications.models import Notification
        
        date_str = appointment.scheduled_at.strftime('%Y-%m-%d %H:%M') if appointment.scheduled_at else "TBD"
        
        create_notification(
            user=appointment.patient.user,
            notification_type=Notification.NotificationType.APPOINTMENT,
            subject="New Appointment Scheduled",
            content=f"An appointment has been scheduled for {date_str}."
        )
        create_notification(
            user=appointment.staff.user,
            notification_type=Notification.NotificationType.APPOINTMENT,
            subject="New Appointment Scheduled",
            content=f"You have a new appointment scheduled for {date_str}."
        )


class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /appointments/<id>  — Retrieve appointment detail.
    PUT    /appointments/<id>  — Update appointment.
    PATCH  /appointments/<id>  — Partial update (e.g., cancel via frontend).
    DELETE /appointments/<id>  — Soft-cancel the appointment.
    """
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Appointment.objects.select_related("patient__user", "staff__user")

        if user.role == "PATIENT":
            try:
                return qs.filter(patient=user.patient_profile)
            except Exception:
                return Appointment.objects.none()
        elif user.role in ("DOCTOR", "NURSE"):
            try:
                return qs.filter(staff=user.staff_profile)
            except Exception:
                return Appointment.objects.none()
        return qs

    def perform_update(self, serializer):
        instance = serializer.save()
        if self.request.data.get("status") == "CANCELLED":
            if instance.status not in ("COMPLETED", "CANCELLED", "NO_SHOW"):
                instance.status = Appointment.Status.CANCELLED
                instance.save(update_fields=["status", "updated_at"])
                
                from notifications.services import create_notification
                from notifications.models import Notification
                date_str = instance.scheduled_at.strftime('%Y-%m-%d %H:%M') if instance.scheduled_at else "TBD"
                
                create_notification(
                    user=instance.patient.user,
                    notification_type=Notification.NotificationType.APPOINTMENT,
                    subject="Appointment Cancelled",
                    content=f"Your appointment on {date_str} has been cancelled."
                )
                create_notification(
                    user=instance.staff.user,
                    notification_type=Notification.NotificationType.APPOINTMENT,
                    subject="Appointment Cancelled",
                    content=f"Appointment on {date_str} has been cancelled."
                )

    def perform_destroy(self, instance):
        # Soft-cancel instead of hard delete
        if instance.status in (
            Appointment.Status.COMPLETED,
            Appointment.Status.CANCELLED,
        ):
            from rest_framework.exceptions import ValidationError
            raise ValidationError(
                f"Cannot cancel an appointment with status '{instance.status}'."
            )
        instance.status = Appointment.Status.CANCELLED
        instance.save(update_fields=["status", "updated_at"])
        
        from notifications.services import create_notification
        from notifications.models import Notification
        date_str = instance.scheduled_at.strftime('%Y-%m-%d %H:%M') if instance.scheduled_at else "TBD"
        
        create_notification(
            user=instance.patient.user,
            notification_type=Notification.NotificationType.APPOINTMENT,
            subject="Appointment Cancelled",
            content=f"Your appointment on {date_str} has been cancelled."
        )
        create_notification(
            user=instance.staff.user,
            notification_type=Notification.NotificationType.APPOINTMENT,
            subject="Appointment Cancelled",
            content=f"Appointment on {date_str} has been cancelled."
        )


class AppointmentStatusView(APIView):
    """
    PATCH /appointments/<id>/status  — Update appointment status with transition rules.
    """
    permission_classes = [IsAuthenticated, IsStaffMember]

    def patch(self, request, pk):
        try:
            appointment = Appointment.objects.select_related(
                "patient__user", "staff__user"
            ).get(pk=pk)
        except Appointment.DoesNotExist:
            return Response(
                {"detail": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AppointmentStatusSerializer(
            data=request.data,
            context={"current_status": appointment.status},
        )
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data["status"]
        cancelled_reason = serializer.validated_data.get("cancelled_reason", "")

        appointment.status = new_status
        if cancelled_reason:
            appointment.cancelled_reason = cancelled_reason

        update_fields = ["status", "updated_at"]
        if cancelled_reason:
            update_fields.append("cancelled_reason")

        appointment.save(update_fields=update_fields)

        from notifications.services import create_notification
        from notifications.models import Notification
        date_str = appointment.scheduled_at.strftime('%Y-%m-%d %H:%M') if appointment.scheduled_at else "TBD"
        
        create_notification(
            user=appointment.patient.user,
            notification_type=Notification.NotificationType.APPOINTMENT,
            subject=f"Appointment Status Updated: {new_status}",
            content=f"Your appointment on {date_str} is now {new_status}."
        )
        create_notification(
            user=appointment.staff.user,
            notification_type=Notification.NotificationType.APPOINTMENT,
            subject=f"Appointment Status Updated: {new_status}",
            content=f"Appointment on {date_str} is now {new_status}."
        )

        return Response(
            AppointmentSerializer(appointment, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


class AvailableSlotsView(APIView):
    """
    GET /appointments/available-slots?staff_id=<id>&date=<YYYY-MM-DD>

    Returns a list of available 30-minute time slots for a staff member on a date.
    Working hours: 08:00–17:00. Slots that overlap existing appointments are excluded.
    """
    permission_classes = [IsAuthenticated]

    SLOT_DURATION = 30       # minutes
    WORK_START    = time(8, 0)
    WORK_END      = time(17, 0)

    def get(self, request):
        staff_id = request.query_params.get("staff_id")
        date_str = request.query_params.get("date")

        if not staff_id or not date_str:
            return Response(
                {"detail": "Both 'staff_id' and 'date' query parameters are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            query_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"detail": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Fetch existing appointments for this staff on this date
        existing = Appointment.objects.filter(
            staff_id=staff_id,
            scheduled_at__date=query_date,
        ).exclude(
            status__in=["CANCELLED", "NO_SHOW"]
        ).values_list("scheduled_at", "duration_min")

        # Build list of busy intervals (start, end) as naive times
        busy = []
        for appt_start, dur in existing:
            appt_end = appt_start + timedelta(minutes=dur)
            busy.append((appt_start.time(), appt_end.time()))

        # Generate all slots within working hours
        available = []
        slot_start = datetime.combine(query_date, self.WORK_START)
        work_end = datetime.combine(query_date, self.WORK_END)

        while slot_start + timedelta(minutes=self.SLOT_DURATION) <= work_end:
            slot_end = slot_start + timedelta(minutes=self.SLOT_DURATION)
            slot_start_t = slot_start.time()
            slot_end_t = slot_end.time()

            # Check if this slot overlaps any busy interval
            is_free = not any(
                b_start < slot_end_t and b_end > slot_start_t
                for b_start, b_end in busy
            )

            if is_free:
                available.append({
                    "start": slot_start.strftime("%H:%M"),
                    "end": slot_end.strftime("%H:%M"),
                    "datetime": slot_start.isoformat(),
                })

            slot_start += timedelta(minutes=self.SLOT_DURATION)

        return Response({
            "staff_id": staff_id,
            "date": date_str,
            "slot_duration_minutes": self.SLOT_DURATION,
            "available_slots": available,
        })
