"""
Audit Serializers — Owner: Kyrillos

Serializers for audit log listing and export.
"""

from rest_framework import serializers
from .models import AuditLog


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement AuditLogSerializer
#   - Fields: id, user_email, action, entity_type, entity_id,
#             timestamp, details, ip_address, user_agent
#   - All fields read-only (audit logs are immutable)
#   - user_email: from user.email (null-safe for system actions)
#   - Format timestamp in ISO 8601
# ──────────────────────────────────────────────────────
class AuditLogSerializer(serializers.ModelSerializer):
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
        # TODO (Kyrillos): Return obj.user.email or "System" if user is None
        pass

    def get_user_name(self, obj):
        # TODO (Kyrillos): Return obj.user full name or "System" if None
        pass
