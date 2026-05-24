"""
Patients Admin — Owner: Abanob
"""

from django.contrib import admin
from .models import Patient


# ──────────────────────────────────────────────────────
# TODO (Abanob): Customize PatientAdmin
#   - list_display: user name, national_id, blood_type, date_of_birth
#   - list_filter: blood_type
#   - search_fields: user__first_name, user__last_name, national_id
#   - Add inline for related models if needed
# ──────────────────────────────────────────────────────
@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    # TODO (Abanob): Customize admin display
    pass
