"""
Consent Admin — Owner: Abdullah
"""

from django.contrib import admin
from .models import Consent

# ──────────────────────────────────────────────────────
# TODO (Abdullah): Customize ConsentAdmin
#   - list_display: patient, staff, purpose, is_active, granted_at, revoked_at
#   - list_filter: purpose, is_active
#   - search_fields: patient__user__first_name, staff__user__first_name
#   - Add date_hierarchy on granted_at
# ──────────────────────────────────────────────────────




@admin.register(Consent)
class ConsentAdmin(admin.ModelAdmin):
    list_display = (
        "patient", 
        "staff", 
        "purpose", 
        "is_active", 
        "granted_at", 
        "revoked_at"
    )
    
    list_filter = ("purpose", "is_active")
    
    search_fields = (
        "patient__user__first_name", 
        "staff__user__first_name"
    )
    
    date_hierarchy = "granted_at"
    
    readonly_fields = ("granted_at", "revoked_at")