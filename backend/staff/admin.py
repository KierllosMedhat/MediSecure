"""
Staff Admin — Owner: Kyrillos
"""

from django.contrib import admin
from .models import Staff


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Customize StaffAdmin
#   - list_display: user name, department, hospital, license_no, is_active
#   - list_filter: department, hospital, is_active, user__role
#   - search_fields: user__first_name, user__last_name, user__email, license_no
# ──────────────────────────────────────────────────────
@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    # TODO (Kyrillos): Customize admin display
    pass
