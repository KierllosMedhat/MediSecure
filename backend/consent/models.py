"""
Consent Models — Owner: Abdullah

Defines the Consent entity for PDPL-compliant data access management.
Patients grant/revoke consent for staff to access their records.
"""

from django.db import models
from django.conf import settings
from django.utils import timezone


class Consent(models.Model):
    """
    PDPL consent record — tracks patient authorization for staff
    to access their medical data for a specific purpose.
    """

    class Purpose(models.TextChoices):
        TREATMENT = "TREATMENT", "Treatment"
        RESEARCH = "RESEARCH", "Research"
        INSURANCE = "INSURANCE", "Insurance"
        BILLING = "BILLING", "Billing"
        EMERGENCY = "EMERGENCY", "Emergency"
        REFERRAL = "REFERRAL", "Referral"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        GRANTED = "GRANTED", "Granted"
        DENIED = "DENIED", "Denied"
        REVOKED = "REVOKED", "Revoked"

    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="consents",
    )
    staff = models.ForeignKey(
        "staff.Staff",
        on_delete=models.CASCADE,
        related_name="consent_grants",
    )
    purpose = models.CharField(
        max_length=20,
        choices=Purpose.choices,
    )
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
    )
    description = models.TextField(blank=True, default="")
    granted_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "consents"
        ordering = ["-granted_at"]
        verbose_name = "Consent"
        verbose_name_plural = "Consents"
        # Prevent duplicate granted consents for same patient+staff+purpose
        constraints = [
            models.UniqueConstraint(
                fields=["patient", "staff", "purpose"],
                condition=models.Q(status="GRANTED"),
                name="unique_granted_consent",
            )
        ]

    def __str__(self):
        return f"Consent ({self.status}): {self.purpose} — Patient #{self.patient_id}"

    def revoke(self):
        """Soft-delete/Revoke logic for PDPL compliance"""
        self.status = self.Status.REVOKED
        self.revoked_at = timezone.now()
        self.save(update_fields=['status', 'revoked_at'])