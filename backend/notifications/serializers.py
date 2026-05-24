"""
Notifications Serializers — Owner: Kyrillos

Serializers for notification listing, creation, and mark-as-read.
"""

from rest_framework import serializers
from .models import Notification


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement NotificationSerializer
#   - Fields: id, user, notification_type, channel, subject,
#             content, is_read, sent_at, delivered_at, read_at
#   - Read-only: id, user, sent_at, delivered_at
# ──────────────────────────────────────────────────────
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id", "user", "notification_type", "channel",
            "subject", "content", "is_read",
            "sent_at", "delivered_at", "read_at",
        ]
        read_only_fields = ["id", "user", "sent_at", "delivered_at"]


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement NotificationCreateSerializer
#   - Fields: user, notification_type, channel, subject, content
#   - Used by system/services to create notifications
#   - Auto-set sent_at to now
#   - If channel is EMAIL → trigger email send
#   - If channel is SMS → trigger SMS send
# ──────────────────────────────────────────────────────
class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["user", "notification_type", "channel", "subject", "content"]

    def create(self, validated_data):
        # TODO (Kyrillos): Create notification record
        # TODO (Kyrillos): If channel == EMAIL, send email asynchronously
        # TODO (Kyrillos): If channel == SMS, send SMS asynchronously
        # TODO (Kyrillos): Set delivered_at when send is confirmed
        pass
