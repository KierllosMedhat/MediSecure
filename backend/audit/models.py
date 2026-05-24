"""
Audit Models — Owner: Kyrillos

Defines the AuditLog entity for PDPL-compliant immutable activity logging.
Every sensitive action in the system should produce an audit log entry.
"""

from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    """
    Immutable audit log entry recording every sensitive action.
    Records who did what, to which entity, when, and from where.
    """

    class Action(models.TextChoices):
        # Auth
        LOGIN = "LOGIN", "Login"
        LOGOUT = "LOGOUT", "Logout"
        PASSWORD_CHANGE = "PASSWORD_CHANGE", "Password Change"
        PASSWORD_RESET = "PASSWORD_RESET", "Password Reset"
        # Records
        RECORD_VIEW = "RECORD_VIEW", "Record Viewed"
        RECORD_CREATE = "RECORD_CREATE", "Record Created"
        RECORD_UPDATE = "RECORD_UPDATE", "Record Updated"
        RECORD_DELETE = "RECORD_DELETE", "Record Deleted"
        DOCUMENT_UPLOAD = "DOCUMENT_UPLOAD", "Document Uploaded"
        DOCUMENT_DOWNLOAD = "DOCUMENT_DOWNLOAD", "Document Downloaded"
        DOCUMENT_DELETE = "DOCUMENT_DELETE", "Document Deleted"
        # Consent
        CONSENT_GRANT = "CONSENT_GRANT", "Consent Granted"
        CONSENT_REVOKE = "CONSENT_REVOKE", "Consent Revoked"
        # Payments
        PAYMENT_INITIATE = "PAYMENT_INITIATE", "Payment Initiated"
        PAYMENT_SUCCESS = "PAYMENT_SUCCESS", "Payment Successful"
        PAYMENT_FAILED = "PAYMENT_FAILED", "Payment Failed"
        PAYMENT_REFUND = "PAYMENT_REFUND", "Payment Refunded"
        # Staff
        STAFF_CREATE = "STAFF_CREATE", "Staff Created"
        STAFF_UPDATE = "STAFF_UPDATE", "Staff Updated"
        STAFF_DELETE = "STAFF_DELETE", "Staff Deactivated"
        # Appointments
        APPOINTMENT_CREATE = "APPOINTMENT_CREATE", "Appointment Created"
        APPOINTMENT_UPDATE = "APPOINTMENT_UPDATE", "Appointment Updated"
        APPOINTMENT_CANCEL = "APPOINTMENT_CANCEL", "Appointment Cancelled"
        # Generic
        OTHER = "OTHER", "Other"

    class EntityType(models.TextChoices):
        USER = "USER", "User"
        PATIENT = "PATIENT", "Patient"
        STAFF = "STAFF", "Staff"
        RECORD = "RECORD", "Medical Record"
        DOCUMENT = "DOCUMENT", "Document"
        CONSENT = "CONSENT", "Consent"
        PAYMENT = "PAYMENT", "Payment"
        APPOINTMENT = "APPOINTMENT", "Appointment"
        NOTIFICATION = "NOTIFICATION", "Notification"
        HOSPITAL = "HOSPITAL", "Hospital"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="audit_logs",
        help_text="User who performed the action. Null if system action.",
    )
    action = models.CharField(max_length=30, choices=Action.choices)
    entity_type = models.CharField(max_length=20, choices=EntityType.choices)
    entity_id = models.CharField(
        max_length=50,
        help_text="Primary key of the affected entity.",
    )
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    details = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional context about the action (e.g., changed fields).",
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default="")

    class Meta:
        db_table = "audit_logs"
        ordering = ["-timestamp"]
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"
        # Audit logs are immutable — no update/delete in application layer

    def __str__(self):
        user_str = self.user.email if self.user else "System"
        return f"[{self.timestamp}] {user_str} — {self.action} on {self.entity_type} #{self.entity_id}"
