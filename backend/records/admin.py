"""
Records Admin — Owner: Fadi
"""

from django.contrib import admin
from .models import MedicalRecord, Document


# ──────────────────────────────────────────────────────
# TODO (Fadi): Customize MedicalRecordAdmin
#   - list_display: title, patient, record_type, created_by, created_at
#   - list_filter: record_type, created_at
#   - search_fields: title, description, patient__user__first_name
#   - Add DocumentInline (TabularInline) to show documents in record
# ──────────────────────────────────────────────────────
@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    # TODO (Fadi): Customize admin display
    pass


# ──────────────────────────────────────────────────────
# TODO (Fadi): Customize DocumentAdmin
#   - list_display: file_name, file_type, file_size, record, uploaded_by, created_at
#   - list_filter: file_type
#   - search_fields: file_name
# ──────────────────────────────────────────────────────
@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    # TODO (Fadi): Customize admin display
    pass
