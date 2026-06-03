"""
Patients admin configuration.
"""

from django.contrib import admin

from .models import Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "national_id",
        "blood_type",
        "date_of_birth",
        "created_at",
    )
    list_filter = ("blood_type", "created_at")
    search_fields = (
        "national_id",
        "user__email",
        "user__first_name",
        "user__middle_name",
        "user__last_name",
    )
    readonly_fields = ("created_at", "updated_at")

    @admin.display(description="Name")
    def full_name(self, obj):
        return " ".join(
            part
            for part in [obj.user.first_name, obj.user.middle_name, obj.user.last_name]
            if part
        )
