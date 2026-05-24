"""
Appointments Admin — Owner: Kyrillos
"""

from django.contrib import admin
from .models import Appointment


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Customize AppointmentAdmin
#   - list_display: patient, staff, scheduled_at, duration_min,
#                   status, appointment_type
#   - list_filter: status, appointment_type, scheduled_at
#   - search_fields: patient__user__first_name, staff__user__first_name, notes
#   - Add date_hierarchy on scheduled_at
# ──────────────────────────────────────────────────────
@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    # TODO (Kyrillos): Customize admin display
    pass
