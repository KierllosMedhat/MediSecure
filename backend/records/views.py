"""
Records Views — Owner: Fadi

API views aligned to frontend recordsService.js:
  GET    /patients/<id>/records           → MedicalRecordListCreateView (getRecords)
  GET    /patients/<id>/records/<id>      → MedicalRecordDetailView     (getRecordById)
  POST   /records                         → MedicalRecordListCreateView  (createRecord)
  GET    /records/<id>/documents          → DocumentListView             (getDocumentsByRecord)
  POST   /records/<id>/documents          → DocumentUploadView           (uploadDocument)
  GET    /documents/<id>/download         → DocumentDownloadView         (downloadDocument, blob)
  GET    /records/recent-uploads          → RecentUploadsView
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import MedicalRecord, Document
from .serializers import (
    MedicalRecordListSerializer,
    MedicalRecordDetailSerializer,
    DocumentSerializer,
    RecentUploadsSerializer,
)


# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement MedicalRecordListCreateView
#   - GET  /api/v1/patients/<patient_id>/records
#          Frontend: getRecords(patientId, { record_type, from_date })
#          patient_id from URL kwarg; record_type + from_date from query params
#   - POST /api/v1/records
#          Frontend: createRecord({ patient_id, record_type, title, description })
#          patient_id comes from request body on POST
#   - Enforce: patients can only see their own records
#   - Staff can see records for any patient they have consent for
#   - Order by created_at descending
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────
class MedicalRecordListCreateView(generics.ListCreateAPIView):
    """List records for a patient (GET) or create a new record (POST)."""
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return MedicalRecordDetailSerializer
        return MedicalRecordListSerializer

    def get_queryset(self):
        patient_id = self.kwargs.get("patient_id")
        queryset = MedicalRecord.objects.all().order_by("-created_at")
        
        if patient_id:
            if patient_id == "me":
                # Ensure the user has a patient profile
                if hasattr(self.request.user, "patient_profile"):
                    queryset = queryset.filter(patient_id=self.request.user.patient_profile.id)
                else:
                    return MedicalRecord.objects.none()
            else:
                if getattr(self.request.user, 'role', '') in ["DOCTOR", "NURSE", "BILLING_STAFF"]:
                    from consent.models import Consent
                    if not hasattr(self.request.user, 'staff_profile') or not Consent.objects.filter(
                        patient_id=patient_id,
                        staff=self.request.user.staff_profile,
                        status="GRANTED"
                    ).exists():
                        from rest_framework.exceptions import PermissionDenied
                        raise PermissionDenied("You must request access and be granted consent to view this patient's records.")
                queryset = queryset.filter(patient_id=patient_id)
        
        # Optional filters
        record_type = self.request.query_params.get("record_type")
        if record_type and record_type != 'all':
            queryset = queryset.filter(record_type=record_type.upper())
            
        return queryset

    def create(self, request, *args, **kwargs):
        import sys
        print("====== DEBUG CREATE RECORD ======", flush=True)
        print("DATA:", request.data, flush=True)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("ERRORS:", serializer.errors, flush=True)
        sys.stdout.flush()
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        patient_id = self.request.data.get("patient_id") or self.request.data.get("patient")
        
        # If 'me' is sent, or if the user is a patient, strictly attach to their own profile
        if patient_id == "me" or (hasattr(self.request.user, "role") and self.request.user.role == "PATIENT"):
            if hasattr(self.request.user, "patient_profile"):
                patient_id = self.request.user.patient_profile.id
            else:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"patient": ["User does not have a patient profile to attach records to."]})
                
        if not patient_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"patient": ["This field is required."]})
            
        record = serializer.save(created_by=self.request.user, patient_id=patient_id)
        
        from notifications.services import create_notification
        from notifications.models import Notification
        
        create_notification(
            user=record.patient.user,
            notification_type=Notification.NotificationType.RECORD,
            subject="New Medical Record Added",
            content=f"A new medical record has been added to your profile."
        )


# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement MedicalRecordDetailView
#   - GET /api/v1/patients/<patient_id>/records/<pk>
#   - Frontend: getRecordById(patientId, recordId)
#   - Both patient_id and pk come from URL kwargs
#   - Return record with nested documents list
#   - Permission: IsAuthenticated + owner/staff check
# ──────────────────────────────────────────────────────
class MedicalRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a medical record."""
    serializer_class = MedicalRecordDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        patient_id = self.kwargs.get("patient_id")
        queryset = MedicalRecord.objects.all()
        if patient_id:
            if patient_id == "me":
                if hasattr(self.request.user, "patient_profile"):
                    queryset = queryset.filter(patient_id=self.request.user.patient_profile.id)
                else:
                    return MedicalRecord.objects.none()
            else:
                if getattr(self.request.user, 'role', '') in ["DOCTOR", "NURSE", "BILLING_STAFF"]:
                    from consent.models import Consent
                    if not hasattr(self.request.user, 'staff_profile') or not Consent.objects.filter(
                        patient_id=patient_id,
                        staff=self.request.user.staff_profile,
                        status="GRANTED"
                    ).exists():
                        from rest_framework.exceptions import PermissionDenied
                        raise PermissionDenied("You must request access and be granted consent to view this patient's records.")
                queryset = queryset.filter(patient_id=patient_id)
        return queryset


# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement DocumentListView
#   - GET /api/v1/records/<record_id>/documents
#   - Frontend: getDocumentsByRecord(recordId)
#   - Return all documents attached to the given record
#   - Permission: IsAuthenticated + record access check
# ──────────────────────────────────────────────────────
class DocumentListUploadView(generics.ListCreateAPIView):
    """List documents for a record (GET) and upload new documents (POST)."""
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = None

    def get_queryset(self):
        record_id = self.kwargs.get("record_id")
        queryset = Document.objects.all()
        if record_id:
            record = MedicalRecord.objects.filter(id=record_id).first()
            if record:
                patient_id = record.patient_id
                if getattr(self.request.user, 'role', '') in ["DOCTOR", "NURSE", "BILLING_STAFF"]:
                    from consent.models import Consent
                    if not hasattr(self.request.user, 'staff_profile') or not Consent.objects.filter(
                        patient_id=patient_id,
                        staff=self.request.user.staff_profile,
                        status="GRANTED"
                    ).exists():
                        from rest_framework.exceptions import PermissionDenied
                        raise PermissionDenied("You must request access and be granted consent to view this patient's records.")
            queryset = queryset.filter(record_id=record_id)
        return queryset

    def perform_create(self, serializer):
        record_id = self.kwargs.get("record_id")
        uploaded_file = self.request.FILES.get("file_path") or self.request.FILES.get("file")
        
        file_size = uploaded_file.size if uploaded_file else 0
        content_type = uploaded_file.content_type if uploaded_file else ""
        
        file_type = "OTHER"
        if "pdf" in content_type:
            file_type = "PDF"
        elif "image" in content_type:
            file_type = "IMAGE"
        elif "csv" in content_type:
            file_type = "CSV"
            
        file_name = uploaded_file.name if uploaded_file else "unknown"
        
        serializer.save(
            record_id=record_id,
            uploaded_by=self.request.user,
            file_path=uploaded_file,
            file_size=file_size,
            file_type=file_type,
            file_name=file_name
        )


# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement DocumentDownloadView
#   - GET /api/v1/documents/<pk>/download
#   - Frontend: downloadDocument(documentId) — responseType: 'blob'
#   - Serve the file as a binary download
#   - For local storage: use FileResponse
#   - For S3: redirect to a pre-signed URL (302)
#   - Set Content-Disposition: attachment; filename="<file_name>"
#   - Log download event in audit log
#   - Permission: IsAuthenticated + record access check
# ──────────────────────────────────────────────────────
class DocumentDownloadView(APIView):
    """Download a document as a binary file (blob)."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            document = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Document not found.")
            
        if not document.file_path or not document.file_path.name:
            from rest_framework.exceptions import NotFound
            raise NotFound("File not found on server.")
            
        from django.http import FileResponse
        response = FileResponse(document.file_path.open('rb'), as_attachment=True, filename=document.file_name)
        return response


# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement DocumentDeleteView
#   - DELETE /api/v1/records/documents/<pk>
#   - Delete the file from storage AND the DB record
#   - Permission: IsAuthenticated + uploader or admin
# ──────────────────────────────────────────────────────
class DocumentDeleteView(generics.DestroyAPIView):
    """Delete a document and its file from storage."""
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO (Fadi): Return queryset filtered to accessible documents
        pass

    def perform_destroy(self, instance):
        # TODO (Fadi): Delete the physical file from storage
        # TODO (Fadi): Then call instance.delete()
        pass


# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement RecentUploadsView
#   - GET /api/v1/records/recent-uploads
#   - Last 10 documents accessible to the current user
#   - For dashboard widget
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────
class RecentUploadsView(generics.ListAPIView):
    """Recent document uploads for dashboard widget."""
    serializer_class = RecentUploadsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return last 10 documents
        return Document.objects.all().order_by('-created_at')[:10]
