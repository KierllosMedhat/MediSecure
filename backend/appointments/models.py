"""
Appointments Models — Owner: Kyrillos

Defines the Appointment entity for scheduling patient-staff meetings.
"""

from django.db import models
from django.conf import settings


class Appointment(models.Model):
    """
    Appointment between a patient and a staff member.
    """

    class Status(models.TextChoices):
        SCHEDULED = "SCHEDULED", "Scheduled"
        CONFIRMED = "CONFIRMED", "Confirmed"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"
        NO_SHOW = "NO_SHOW", "No Show"

    class AppointmentType(models.TextChoices):
        IN_PERSON = "IN_PERSON", "In-Person"
        TELEMEDICINE = "TELEMEDICINE", "Telemedicine"
        FOLLOW_UP = "FOLLOW_UP", "Follow-Up"
        EMERGENCY = "EMERGENCY", "Emergency"

    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    staff = models.ForeignKey(
        "staff.Staff",
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    scheduled_at = models.DateTimeField()
    duration_min = models.PositiveIntegerField(
        default=30,
        help_text="Duration in minutes.",
    )
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.SCHEDULED,
    )
    appointment_type = models.CharField(
        max_length=15,
        choices=AppointmentType.choices,
        default=AppointmentType.IN_PERSON,
    )
    location = models.CharField(max_length=255, blank=True, default="")
    notes = models.TextField(blank=True, default="")
    cancelled_reason = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "appointments"
        ordering = ["-scheduled_at"]
        verbose_name = "Appointment"
        verbose_name_plural = "Appointments"

    def __str__(self):
        return f"Appointment: {self.patient} → {self.staff} at {self.scheduled_at}"
