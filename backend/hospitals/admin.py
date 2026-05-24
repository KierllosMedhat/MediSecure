"""
Hospitals Admin — Owner: Fadi
"""

from django.contrib import admin
from .models import Hospital


# ──────────────────────────────────────────────────────
# TODO (Fadi): Customize HospitalAdmin
#   - list_display: name, email, phone, subscription, is_active
#   - list_filter: subscription, is_active
#   - search_fields: name, email
# ──────────────────────────────────────────────────────
@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    # TODO (Fadi): Customize admin display
    pass
