"""
Notifications Admin — Owner: Kyrillos
"""

from django.contrib import admin
from .models import Notification


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Customize NotificationAdmin
#   - list_display: user, subject, notification_type, channel, is_read, sent_at
#   - list_filter: notification_type, channel, is_read
#   - search_fields: subject, content, user__email
#   - Add date_hierarchy on sent_at
# ──────────────────────────────────────────────────────
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    # TODO (Kyrillos): Customize admin display
    pass
