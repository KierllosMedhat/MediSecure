"""
Audit Admin — Implemented by Kyrillos

Audit logs are immutable: add/change/delete are all disabled in admin.
"""

from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = [
        "id", "get_user_email", "action", "entity_type",
        "entity_id", "timestamp", "ip_address",
    ]
    list_filter = ["action", "entity_type"]
    search_fields = ["user__email", "entity_id", "ip_address"]
    date_hierarchy = "timestamp"
    list_select_related = ["user"]

    # All fields are read-only — audit logs must never be edited
    readonly_fields = [
        "user", "action", "entity_type", "entity_id",
        "timestamp", "details", "ip_address", "user_agent",
    ]

    # Disable add, change, and delete — view only
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.display(description="User")
    def get_user_email(self, obj):
        return obj.user.email if obj.user else "System"
