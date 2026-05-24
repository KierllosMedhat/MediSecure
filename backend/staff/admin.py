"""
Staff Admin — Implemented by Kyrillos
"""

from django.contrib import admin
from .models import Staff


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = [
        "get_full_name", "get_email", "get_role",
        "department", "get_hospital", "license_no", "is_active", "hired_at",
    ]
    list_filter = ["department", "hospital", "is_active", "user__role"]
    search_fields = [
        "user__first_name", "user__last_name",
        "user__email", "license_no",
    ]
    list_select_related = ["user", "hospital"]
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        ("User Account", {"fields": ("user",)}),
        ("Staff Details", {"fields": (
            "hospital", "department", "license_no", "address",
        )}),
        ("Status", {"fields": ("is_active", "hired_at")}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    @admin.display(description="Full Name")
    def get_full_name(self, obj):
        u = obj.user
        return f"{u.first_name} {u.last_name}".strip() or u.email

    @admin.display(description="Email")
    def get_email(self, obj):
        return obj.user.email

    @admin.display(description="Role")
    def get_role(self, obj):
        return obj.user.role

    @admin.display(description="Hospital")
    def get_hospital(self, obj):
        return obj.hospital.name
