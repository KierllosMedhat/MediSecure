"""
Audit Serializers — Implemented by Kyrillos
All fields are read-only — audit logs are immutable.
"""

from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    """Read-only serializer for audit log entries."""

    user_email = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            "id", "user_email", "user_name",
            "action", "entity_type", "entity_id",
            "timestamp", "details", "ip_address", "user_agent",
        ]
        read_only_fields = fields

    def get_user_email(self, obj):
        return obj.user.email if obj.user else "System"

    def get_user_name(self, obj):
        if not obj.user:
            return "System"
        u = obj.user
        parts = [u.first_name, u.middle_name, u.last_name]
        return " ".join(p for p in parts if p).strip() or u.email
