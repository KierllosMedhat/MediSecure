"""
Notifications Admin — Implemented by Kyrillos
"""

from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        "id", "get_user_email", "subject", "notification_type",
        "channel", "is_read", "sent_at",
    ]
    list_filter = ["notification_type", "channel", "is_read"]
    search_fields = ["subject", "content", "user__email"]
    date_hierarchy = "sent_at"
    list_select_related = ["user"]
    readonly_fields = ["sent_at", "delivered_at", "read_at"]

    fieldsets = (
        ("Recipient", {"fields": ("user",)}),
        ("Message", {"fields": ("notification_type", "channel", "subject", "content")}),
        ("Status", {"fields": ("is_read",)}),
        ("Timestamps", {
            "fields": ("sent_at", "delivered_at", "read_at"),
            "classes": ("collapse",),
        }),
    )

    @admin.display(description="User")
    def get_user_email(self, obj):
        return obj.user.email
