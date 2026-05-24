"""
Appointments Admin — Implemented by Kyrillos
"""

from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = [
        "id", "get_patient", "get_staff", "scheduled_at",
        "duration_min", "status", "appointment_type",
    ]
    list_filter = ["status", "appointment_type"]
    search_fields = [
        "patient__user__first_name", "patient__user__last_name",
        "staff__user__first_name", "staff__user__last_name",
        "notes",
    ]
    date_hierarchy = "scheduled_at"
    list_select_related = ["patient__user", "staff__user"]
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        ("Parties", {"fields": ("patient", "staff")}),
        ("Schedule", {"fields": (
            "scheduled_at", "duration_min", "appointment_type", "location",
        )}),
        ("Status", {"fields": ("status", "cancelled_reason")}),
        ("Notes", {"fields": ("notes",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    @admin.display(description="Patient")
    def get_patient(self, obj):
        u = obj.patient.user
        return f"{u.first_name} {u.last_name}".strip() or u.email

    @admin.display(description="Staff")
    def get_staff(self, obj):
        u = obj.staff.user
        return f"{u.first_name} {u.last_name}".strip() or u.email
