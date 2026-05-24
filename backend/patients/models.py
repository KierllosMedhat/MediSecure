"""
Patients Models — Owner: Abanob

Defines the Patient profile linked to User via OneToOneField.
"""

from django.db import models
from django.conf import settings


class Patient(models.Model):
    """
    Patient profile extending the User model.
    Linked via OneToOneField to AUTH_USER_MODEL.
    """

    class BloodType(models.TextChoices):
        A_POS = "A+", "A+"
        A_NEG = "A-", "A-"
        B_POS = "B+", "B+"
        B_NEG = "B-", "B-"
        AB_POS = "AB+", "AB+"
        AB_NEG = "AB-", "AB-"
        O_POS = "O+", "O+"
        O_NEG = "O-", "O-"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="patient_profile",
    )
    national_id = models.CharField(max_length=20, unique=True)
    date_of_birth = models.DateField()
    blood_type = models.CharField(
        max_length=5,
        choices=BloodType.choices,
        blank=True,
        default="",
    )
    emergency_contact_name = models.CharField(max_length=255, blank=True, default="")
    emergency_contact_phone = models.CharField(max_length=20, blank=True, default="")
    address = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "patients"
        verbose_name = "Patient"
        verbose_name_plural = "Patients"

    def __str__(self):
        return f"Patient: {self.user.first_name} {self.user.last_name}"
