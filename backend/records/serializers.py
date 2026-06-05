"""
Records Serializers — Owner: Fadi

Serializers for medical records and document management.
"""

from rest_framework import serializers
from .models import MedicalRecord, Document
import os


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

    uploaded_by_name = serializers.SerializerMethodField(method_name="get_uploaded_by_name")

    class Meta:
        model = Document
        fields = [
            "id", "record", "uploaded_by", "uploaded_by_name",
            "file_name", "file_path", "file_type", "file_size",
            "created_at",
        ]
        read_only_fields = ["id", "uploaded_by", "file_size", "created_at"]

    def get_uploaded_by_name(self, obj):
        # TODO (Fadi): Return uploader's full name
        
        user = obj.uploaded_by
        if user is None:
            return None
        parts = [user.first_name, user.middle_name, user.last_name]
        return " ".join(p for p in parts if p).strip() or user.email

    def validate_file_path(self, value):
        # TODO (Fadi): Validate file size (max 50MB) and allowed types
        if value.size > 50 * 1024 * 1024:
            raise serializers.ValidationError("File size must be less than 50MB.")

        ext = os.path.splitext(value.name)[-1].lower()
        allowed_extensions = {".pdf", ".jpg", ".jpeg", ".png", ".dcm", ".csv"}
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported file type '{ext}'. Allowed: {allowed_extensions}"
            )
            return value

    def create(self, validated_data):
        # TODO (Fadi): Auto-set uploaded_by from request.user
        # TODO (Fadi): Auto-detect file_type from extension
        # TODO (Fadi): Calculate file_size from uploaded file

        
        request = self.context["request"]
        uploaded_file = validated_data["file_path"]

        # Inline extension → FileType mapping (replaces FileType.from_upload())
        ext = os.path.splitext(uploaded_file.name)[-1].lower()
        file_type_map = {
            ".pdf":  Document.FileType.PDF,
            ".jpg":  Document.FileType.IMAGE,
            ".jpeg": Document.FileType.IMAGE,
            ".png":  Document.FileType.IMAGE,
            ".dcm":  Document.FileType.DICOM,
            ".csv":  Document.FileType.CSV,
        }

        validated_data["uploaded_by"] = request.user
        validated_data["file_size"]   = uploaded_file.size
        validated_data["file_type"]   = file_type_map.get(ext, Document.FileType.OTHER)
        validated_data["file_name"]   = validated_data.get("file_name") or os.path.basename(uploaded_file.name)

        return Document.objects.create(**validated_data)


# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement MedicalRecordListSerializer
#   - Fields: id, patient, created_by, record_type, title,
#             document_count, created_at
#   - Include document_count as computed field
#   - Used for list views (lightweight, no description)
# ──────────────────────────────────────────────────────
class MedicalRecordListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField(method_name="get_created_by_name")
    document_count = serializers.SerializerMethodField(method_name="get_document_count")

    class Meta:
        model = MedicalRecord
        fields = [
            "id", "patient", "created_by", "created_by_name",
            "record_type", "title", "document_count", "created_at",
        ]

    def get_created_by_name(self, obj):
        # TODO (Fadi): Return creator's full name
        user = obj.created_by
        if user is None:
            return None
        parts = [user.first_name, user.middle_name, user.last_name]
        return " ".join(p for p in parts if p).strip() or user.email

    def get_document_count(self, obj):
        # TODO (Fadi): Return obj.documents.count()
        return obj.documents.count()


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

    class Meta:
        model = MedicalRecord
        fields = [
            "id", "patient", "created_by", "created_by_name",
            "record_type", "title", "description",
            "documents", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

    def get_created_by_name(self, obj):
        # TODO (Fadi): Return creator's full name
       user = obj.created_by
       if user is None:
          return None
          parts = [user.first_name, user.middle_name, user.last_name]
          return " ".join(p for p in parts if p).strip() or user.email

    def create(self, validated_data):
        # TODO (Fadi): Auto-set created_by from request.user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


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
