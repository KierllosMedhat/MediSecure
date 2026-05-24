"""
Audit Admin — Owner: Kyrillos
"""

from django.contrib import admin
from .models import AuditLog


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Customize AuditLogAdmin
#   - list_display: user email, action, entity_type, entity_id, timestamp, ip_address
#   - list_filter: action, entity_type
#   - search_fields: user__email, entity_id, ip_address
#   - Add date_hierarchy on timestamp
#   - Make all fields read-only (audit logs are immutable)
#   - Disable add/delete permissions in admin
# ──────────────────────────────────────────────────────
@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    # TODO (Kyrillos): Set readonly_fields = "__all__"
    # TODO (Kyrillos): Override has_add_permission → return False
    # TODO (Kyrillos): Override has_delete_permission → return False
    pass
