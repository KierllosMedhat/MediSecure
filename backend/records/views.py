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
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import redirect
from django.http import FileResponse
from django.conf import settings
from .models import MedicalRecord, Document
from consent.models import Consent
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
        # patient_id is in URL kwargs when called via /patients/<id>/records
        patient_id = self.kwargs.get("patient_id")
        # TODO (Fadi): Filter by patient_id from URL or from query params
        # TODO (Fadi): Apply optional filters: record_type, from_date
        # TODO (Fadi): Enforce patient can only see own records
        patientRecords = None

        specificRecordType = self.request.query_params.get("record_type")
        specificFromDate = self.request.query_params.get("from_date")
        if specificRecordType and specificFromDate:
             patientRecords = patientRecords.filter(created_at__gte=specificFromDate,record_type=specificRecordType,patient=patient_id)
        elif specificRecordType:
            patientRecords = patientRecords.filter(record_type=specificRecordType,patient=patient_id)
        elif specificFromDate:
            patientRecords = patientRecords.filter(created_at__gte=specificFromDate,patient=patient_id)
        else:
            patientRecords = patientRecords.filter(patient=patient_id)
        

        accessing_user = self.request.user
        user_profile = accessing_user.patient_profile
        if user_profile.id != patient_id:
            raise PermissionDenied("You do not have permission to view this record")
        return patientRecords

    def perform_create(self, serializer):
        # TODO (Fadi): Set created_by=self.request.user
        newRecord=MedicalRecord.objects.create(created_by=self.request.user, **serializer.validated_data)
        return newRecord


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
        UserRole = self.request.user.role
        
        # TODO (Fadi): Filter by patient_id if present (from patient-scoped URL)
        # TODO (Fadi): Otherwise return all records visible to request.user

        
        record = MedicalRecord.objects.get(id=self.kwargs.get("record_id"))
        if UserRole == "DOCTOR" or UserRole == "NURSE" or UserRole == "BILLING_STAFF":
            currstaff = self.request.user.staff_profile
            if patient_id:
                 consent = Consent.objects.filter(patient=record.patient, staff=currstaff,is_active=True).first()
            if not consent:
                raise PermissionDenied("You do not have permission to view this record")
        
                return MedicalRecord.objects.filter(patient=patient_id)
            else:
                AvailableConsents = Consent.objects.filter(is_active=True,staff=currstaff)
                if AvailableConsents.count() == 0:
                    return []
                allowedRecords = []
                for consent in AvailableConsents:
                    allowedRecords.append(consent.record)
                return allowedRecords
            

# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement DocumentListView
#   - GET /api/v1/records/<record_id>/documents
#   - Frontend: getDocumentsByRecord(recordId)
#   - Return all documents attached to the given record
#   - Permission: IsAuthenticated + record access check
# ──────────────────────────────────────────────────────
class DocumentListView(generics.ListAPIView):
    """List documents for a medical record."""
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        record_id = self.kwargs.get("record_id")
        
        # TODO (Fadi): Return Document.objects.filter(record_id=record_id)
        # TODO (Fadi): Check request.user has access to this record
        
        
        record = get_object_or_404(
            MedicalRecord.objects.select_related("patient"),
            id=record_id,
        )
        try:
            curr_staff = request.user.staff_profile
        except ObjectDoesNotExist:
            raise PermissionDenied("Only staff members can view documents.")
        consent = Consent.objects.filter(patient=record.patient, staff=currstaff,is_active=True).first()
        if not consent:
            raise PermissionDenied("You do not have permission to view this record")
        
        selected_Documents = Document.objects.select_related('uploaded_by').filter(record=record_id).all()
        
        
        return selected_Documents

# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement DocumentUploadView
#   - POST /api/v1/records/<record_id>/documents
#   - Frontend: uploadDocument(recordId, formData)  — multipart/form-data
#   - Accept a file upload (PDF, JPEG, PNG, DICOM, CSV)
#   - Validate file size (max 50MB) and type
#   - Auto-detect file_type from extension
#   - Auto-calculate file_size from uploaded file
#   - Set uploaded_by to request.user
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────
class DocumentUploadView(generics.CreateAPIView):
    """Upload a document to a medical record (multipart)."""
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Document.objects.select_related("record","uploaded_by").all()

    def perform_create(self, serializer):
        record_id = self.kwargs.get("record_id")
        # TODO (Fadi): Validate record exists and request.user has access
        # TODO (Fadi): Auto-set uploaded_by, file_type, file_size
        # TODO (Fadi): Set record from URL record_id
       target_record = get_object_or_404(
            MedicalRecord.objects.select_related("patient"),
            id=record_id,
        )
        
        try:
            curr_staff = self.request.user.staff_profile
        except ObjectDoesNotExist:
            raise PermissionDenied("Only staff members can upload documents.")

        has_consent = Consent.objects.filter(
            patient=target_record.patient,
            staff=curr_staff,
            is_active=True,
        ).exists()                          # .exists() is cheaper than .first()

        if not has_consent:
            raise PermissionDenied("You do not have consent to upload to this record.")
        serializer.save(record=target_record)


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
        # TODO (Fadi): Get Document by pk
        # TODO (Fadi): Check request.user has access to the parent record
        # TODO (Fadi): If local: return FileResponse(open(path, 'rb'), as_attachment=True)
        # TODO (Fadi): If S3: generate pre-signed URL and return redirect
        # TODO (Fadi): Log DOCUMENT_DOWNLOAD in audit log
        target_document = get_object_or_404(
            Document.objects.select_related("record__patient"),
            id=pk,
        )
        target_record = target_document.record
        currstaff = self.request.user.staff_profile
        try:
            curr_staff = request.user.staff_profile
        except ObjectDoesNotExist:
            raise PermissionDenied("Only staff members can download documents.")
        has_consent = Consent.objects.filter(
            patient=target_record.patient,
            staff=curr_staff,
            is_active=True,
        ).exists()

        if not has_consent:
            raise PermissionDenied("You do not have consent to access this document.")

                # Flip to True (or use settings) when S3 / django-storages is configured
        use_s3 = getattr(settings, "USE_S3_STORAGE", False)

        if use_s3:
            # TODO (Fadi): when S3 is enabled:
            # url = generate_presigned_url(bucket, targetDocument.file_path.name, ...)
            # return redirect(url)
            raise PermissionDenied("S3 download not configured yet")

        # Local: file on disk (MEDIA_ROOT)
        return FileResponse(
            targetDocument.file_path.open("rb"),
            as_attachment=True,
            filename=targetDocument.file_name,
        )

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
        try:
            curr_staff = self.request.user.staff_profile
        except ObjectDoesNotExist:
            return Document.objects.none()

        return Document.objects.select_related(
            "record__patient"
        ).filter(
            record__patient__consents__staff=curr_staff,
            record__patient__consents__is_active=True,
        )
        

    def perform_destroy(self, instance):
        # TODO (Fadi): Delete the physical file from storage
        # TODO (Fadi): Then call instance.delete()
        file_storage = instance.file_path.storage
        file_name    = instance.file_path.name
        instance.delete()
        if file_name and file_storage.exists(file_name):
            file_storage.delete(file_name)
        


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
        # TODO (Fadi): Return last 10 documents accessible to request.user
        

        uploadedDocs=Document.objects.select_related(
            "record","uploaded_by"
        ).filter(
            uploaded_by=self.request.user
        ).order_by("-created_at")[:10]

        return uploadedDocs
        
