"""
Records Admin — Owner: Fadi
"""

from django.contrib import admin
from .models import MedicalRecord, Document


class DocumentInline(admin.TabularInline):
    model = Document
    extra = 0
    fields = ("file_name", "file_type", "file_size", "uploaded_by", "created_at")
    readonly_fields = ("file_name", "file_type", "file_size", "uploaded_by", "created_at")


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ("title", "patient", "record_type", "created_by", "created_at")
    list_filter = ("record_type", "created_at")
    search_fields = ("title", "description", "patient__user__first_name")
    inlines = [DocumentInline]


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("file_name", "file_type", "file_size", "record", "uploaded_by", "created_at")
    list_filter = ("file_type",)
    search_fields = ("file_name",)
