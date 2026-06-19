"""
Records Serializers — Owner: Fadi

Serializers for medical records and document management.
"""

from rest_framework import serializers
from .models import MedicalRecord, Document
from patients.models import Patient


# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement DocumentSerializer
#   - Fields: id, record, uploaded_by, file_name, file_path,
#             file_type, file_size, created_at
#   - Read-only: id, uploaded_by, file_size, created_at
#   - Auto-detect file_type from file extension
#   - Calculate file_size from uploaded file
#   - Validate file size limit (e.g., max 50MB)
#   - Validate allowed file types (PDF, PNG, JPG, DICOM, CSV)
# ──────────────────────────────────────────────────────
class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            "id", "record", "uploaded_by", "uploaded_by_name",
            "file_name", "file_path", "file_type", "file_size",
            "created_at",
        ]
        read_only_fields = ["id", "record", "uploaded_by", "file_name", "file_path", "file_type", "file_size", "created_at"]

    def get_uploaded_by_name(self, obj):
        # TODO (Fadi): Return uploader's full name
        pass

    def validate_file_path(self, value):
        # TODO (Fadi): Validate file size (max 50MB) and allowed types
        pass




# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement MedicalRecordListSerializer
#   - Fields: id, patient, created_by, record_type, title,
#             document_count, created_at
#   - Include document_count as computed field
#   - Used for list views (lightweight, no description)
# ──────────────────────────────────────────────────────
class MedicalRecordListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    document_count = serializers.SerializerMethodField()

    class Meta:
        model = MedicalRecord
        fields = [
            "id", "patient", "created_by", "created_by_name",
            "record_type", "title", "document_count", "created_at",
        ]

    def get_created_by_name(self, obj):
        if not obj.created_by:
            return ""
        name = f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
        return name or obj.created_by.email

    def get_document_count(self, obj):
        # TODO (Fadi): Return obj.documents.count()
        pass


# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement MedicalRecordDetailSerializer
#   - All MedicalRecord fields + nested documents list
#   - Include full description
#   - Nested DocumentSerializer for related documents
#   - Read-only: id, created_by, created_at, updated_at
# ──────────────────────────────────────────────────────
class MedicalRecordDetailSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    created_by_name = serializers.SerializerMethodField()
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), required=False)

    class Meta:
        model = MedicalRecord
        fields = [
            "id", "patient", "created_by", "created_by_name",
            "record_type", "title", "description",
            "documents", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

    def get_created_by_name(self, obj):
        if not obj.created_by:
            return ""
        name = f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
        return name or obj.created_by.email




# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement RecentUploadsSerializer
#   - Lightweight serializer for the "recent uploads" dashboard widget
#   - Fields: id, file_name, file_type, record_title, uploaded_at
# ──────────────────────────────────────────────────────
class RecentUploadsSerializer(serializers.ModelSerializer):
    record_title = serializers.CharField(source="record.title", read_only=True)

    class Meta:
        model = Document
        fields = ["id", "file_name", "file_type", "record_title", "created_at"]
