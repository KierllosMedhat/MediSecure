"""
Payments Models — Owner: Abdullah

Defines the Payment entity for multi-gateway billing.
Supports Fawry and international card (Visa/Mastercard) gateways.
"""

from django.db import models
from django.conf import settings


class Payment(models.Model):
    """
    Payment record for a patient billing transaction.
    Supports multiple gateways and tracks full lifecycle.
    """

    class PaymentType(models.TextChoices):
        CONSULTATION = "CONSULTATION", "Consultation"
        LAB_TEST = "LAB_TEST", "Lab Test"
        MEDICATION = "MEDICATION", "Medication"
        PROCEDURE = "PROCEDURE", "Procedure"
        INSURANCE_COPAY = "INSURANCE_COPAY", "Insurance Co-pay"
        OTHER = "OTHER", "Other"

    class GatewayType(models.TextChoices):
        FAWRY = "FAWRY", "Fawry"
        CARD = "CARD", "Card (Visa/Mastercard)"
        CASH = "CASH", "Cash"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        PAID = "PAID", "Paid"
        FAILED = "FAILED", "Failed"
        REFUNDED = "REFUNDED", "Refunded"
        CANCELLED = "CANCELLED", "Cancelled"

    class Currency(models.TextChoices):
        EGP = "EGP", "Egyptian Pound"
        USD = "USD", "US Dollar"
        EUR = "EUR", "Euro"

    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="payments",
    )
    appointment = models.ForeignKey(
        "appointments.Appointment",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(
        max_length=3,
        choices=Currency.choices,
        default=Currency.EGP,
    )
    payment_type = models.CharField(
        max_length=20,
        choices=PaymentType.choices,
    )
    gateway_type = models.CharField(
        max_length=10,
        choices=GatewayType.choices,
    )
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
    )
    gateway_reference_id = models.CharField(
        max_length=255, blank=True, default="",
        help_text="Transaction ID from the payment gateway.",
    )
    receipt_url = models.URLField(blank=True, default="")
    description = models.TextField(blank=True, default="")
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payments"
        ordering = ["-created_at"]
        verbose_name = "Payment"
        verbose_name_plural = "Payments"

    def __str__(self):
        return f"Payment #{self.id} — {self.amount} {self.currency} ({self.status})"
