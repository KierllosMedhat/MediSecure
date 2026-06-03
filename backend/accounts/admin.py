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
    list_display = (
        "email",
        "username",
        "first_name",
        "last_name",
        "role",
        "phone_number",
        "is_active",
        "is_staff",
    )
    list_filter = ("role", "is_active", "is_staff", "is_superuser")
    search_fields = ("email", "username", "first_name", "last_name", "phone_number")
    ordering = ("email",)

    fieldsets = BaseUserAdmin.fieldsets + (
        ("MediSecure Profile", {"fields": ("middle_name", "phone_number", "role")}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("MediSecure Profile", {"fields": ("email", "first_name", "last_name", "middle_name", "phone_number", "role")}),
    )
