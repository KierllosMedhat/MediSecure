"""
Notifications Serializers — Implemented by Kyrillos
"""

from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Read serializer for listing/retrieving notifications."""

    class Meta:
        model = Notification
        fields = [
            "id", "user", "notification_type", "channel",
            "subject", "content", "is_read",
            "sent_at", "delivered_at", "read_at",
        ]
        read_only_fields = fields


class NotificationCreateSerializer(serializers.ModelSerializer):
    """
    Internal serializer for creating notifications.
    Dispatches to the appropriate channel after saving.
    """

    class Meta:
        model = Notification
        fields = ["user", "notification_type", "channel", "subject", "content"]

    def create(self, validated_data):
        notification = Notification.objects.create(**validated_data)

        channel = notification.channel
        delivered = False

        if channel == Notification.Channel.EMAIL:
            delivered = self._send_email(notification)
        elif channel == Notification.Channel.SMS:
            delivered = self._send_sms(notification)
        else:
            # IN_APP — mark as delivered immediately
            delivered = True

        if delivered:
            notification.delivered_at = timezone.now()
            notification.save(update_fields=["delivered_at"])

        return notification

    def _send_email(self, notification):
        """Send notification via Django's email backend. Returns True on success."""
        try:
            send_mail(
                subject=notification.subject,
                message=notification.content,
                from_email=getattr(settings, "EMAIL_HOST_USER", "noreply@medisecure.com"),
                recipient_list=[notification.user.email],
                fail_silently=False,
            )
            return True
        except Exception:
            # Never block the main flow — log and continue
            return False

    def _send_sms(self, notification):
        """
        Send SMS via the configured SMS gateway.
        Placeholder — integrate your SMS provider here.
        """
        # TODO: Integrate SMS provider (e.g., Twilio, Vonage, local Egyptian gateway)
        return False
