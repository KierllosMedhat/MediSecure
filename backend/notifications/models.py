"""
Notifications Models — Owner: Kyrillos

Defines the Notification entity for in-app and push notifications.
"""

from django.db import models
from django.conf import settings


class Notification(models.Model):
    """
    Notification sent to a user (in-app, email, SMS).
    """

    class NotificationType(models.TextChoices):
        APPOINTMENT = "APPOINTMENT", "Appointment"
        RECORD = "RECORD", "Medical Record"
        CONSENT = "CONSENT", "Consent"
        PAYMENT = "PAYMENT", "Payment"
        SYSTEM = "SYSTEM", "System"
        ALERT = "ALERT", "Alert"

    class Channel(models.TextChoices):
        IN_APP = "IN_APP", "In-App"
        EMAIL = "EMAIL", "Email"
        SMS = "SMS", "SMS"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    notification_type = models.CharField(
        max_length=15,
        choices=NotificationType.choices,
    )
    channel = models.CharField(
        max_length=10,
        choices=Channel.choices,
        default=Channel.IN_APP,
    )
    subject = models.CharField(max_length=255)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-sent_at"]
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"

    def __str__(self):
        status = "Read" if self.is_read else "Unread"
        return f"[{status}] {self.subject}"
