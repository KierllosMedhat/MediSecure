"""
Accounts Admin — Owner: Abanob
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


# ──────────────────────────────────────────────────────
# TODO (Abanob): Customize UserAdmin
#   - Add role, phone_number, middle_name to list_display
#   - Add role to list_filter
#   - Add custom fieldsets for the extra fields
#   - Configure search_fields for email, first_name, last_name
# ──────────────────────────────────────────────────────
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # TODO (Abanob): Customize list_display, list_filter, fieldsets
    pass
