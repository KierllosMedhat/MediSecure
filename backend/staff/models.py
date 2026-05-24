"""
Staff Models — Owner: Kyrillos

Defines the Staff profile linked to User and Hospital.
"""

from django.db import models
from django.conf import settings


class Staff(models.Model):
    """
    Staff profile for doctors, nurses, billing staff, and admins.
    Linked to a User and a Hospital.
    """

    class Department(models.TextChoices):
        CARDIOLOGY = "CARDIOLOGY", "Cardiology"
        DERMATOLOGY = "DERMATOLOGY", "Dermatology"
        EMERGENCY = "EMERGENCY", "Emergency"
        GENERAL = "GENERAL", "General Medicine"
        NEUROLOGY = "NEUROLOGY", "Neurology"
        ONCOLOGY = "ONCOLOGY", "Oncology"
        ORTHOPEDICS = "ORTHOPEDICS", "Orthopedics"
        PEDIATRICS = "PEDIATRICS", "Pediatrics"
        RADIOLOGY = "RADIOLOGY", "Radiology"
        SURGERY = "SURGERY", "Surgery"
        BILLING = "BILLING", "Billing"
        ADMIN = "ADMIN", "Administration"
        OTHER = "OTHER", "Other"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="staff_profile",
    )
    hospital = models.ForeignKey(
        "hospitals.Hospital",
        on_delete=models.CASCADE,
        related_name="staff_members",
    )
    department = models.CharField(
        max_length=20,
        choices=Department.choices,
        default=Department.GENERAL,
    )
    license_no = models.CharField(max_length=50, blank=True, default="")
    address = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    hired_at = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "staff"
        verbose_name = "Staff Member"
        verbose_name_plural = "Staff Members"

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} — {self.department}"
