"""
Payments Admin — Owner: Abdullah
"""

from django.contrib import admin
from .models import Payment


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Customize PaymentAdmin
#   - list_display: id, patient, amount, currency, payment_type,
#                   gateway_type, status, paid_at
#   - list_filter: status, gateway_type, payment_type, currency
#   - search_fields: patient__user__first_name, gateway_reference_id, description
#   - Add date_hierarchy on created_at
#   - Make status editable in list view (for manual adjustments)
# ──────────────────────────────────────────────────────
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    # TODO (Abdullah): Customize admin display
    pass
