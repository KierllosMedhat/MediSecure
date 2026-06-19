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
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from django.http import FileResponse
from django.conf import settings
from .models import MedicalRecord, Document
from consent.models import Consent
from patients.models import Patient
from staff.models import Staff
from .serializers import (
    MedicalRecordListSerializer,
    MedicalRecordDetailSerializer,
    DocumentSerializer,
    RecentUploadsSerializer,
)
from audit.utils import log_action
from audit.models import AuditLog


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
<<<<<<< HEAD
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
=======
        # TODO (Fadi): Filter by patient_id from URL or from query params
        # TODO (Fadi): Apply optional filters: record_type, from_date
        # TODO (Fadi): Enforce patient can only see own records
      

        UserRole = self.request.user.role
        curr_staff=None
        if UserRole == 'PATIENT':
            try:
                patientProfile = self.request.user.patient_profile
            except ObjectDoesNotExist:
                raise PermissionDenied("Patient profile not found.")
            if patientProfile.id != patient_id:
                raise PermissionDenied("You do not have permission to view this record")
        elif UserRole == "DOCTOR" or UserRole == "NURSE" or UserRole == "BILLING_STAFF":
            if not patient_id:
                raise PermissionDenied("Invalid patient ID.")

            try:
                curr_staff = self.request.user.staff_profile
            except ObjectDoesNotExist:
                raise PermissionDenied("Only staff members can view records.")


            consent = Consent.objects.filter(patient=patient_id, staff=curr_staff,is_active=True).first()
            if not consent:
                raise PermissionDenied("You do not have permission to view this record")
                
            


        patientRecords = None

        specificRecordType = self.request.query_params.get("record_type")
        specificFromDate = self.request.query_params.get("from_date")
        if specificRecordType and specificFromDate:
            patientRecords = MedicalRecord.objects.select_related("created_by").filter(created_at__gte=specificFromDate,record_type=specificRecordType,patient=patient_id).all()
        elif specificRecordType:
            patientRecords = MedicalRecord.objects.select_related("created_by").filter(record_type=specificRecordType,patient=patient_id).all()
        elif specificFromDate:
            patientRecords = MedicalRecord.objects.select_related("created_by").filter(created_at__gte=specificFromDate,patient=patient_id).all()
        else:
            patientRecords = MedicalRecord.objects.select_related("created_by").filter(patient=patient_id).all()

        patientRecords = patientRecords.order_by("-created_at")
        
        return patientRecords

    def perform_create(self, serializer):
        patient = serializer.validated_data.get('patient')
        user_role = self.request.user.role

        if patient is None:
            raise PermissionDenied("Invalid Patient ID")


        if user_role == "PATIENT":
            if self.request.user.patient_profile != patient:
                raise PermissionDenied("You can only create records for yourself.")

        elif user_role in ("DOCTOR", "NURSE", "BILLING_STAFF"):
            try:
                curr_staff = self.request.user.staff_profile
            except ObjectDoesNotExist:
                raise PermissionDenied("Staff profile not found.")
            has_consent = Consent.objects.filter(
                patient=patient.id,
                staff=curr_staff,
                is_active=True,
            ).exists()
            if not has_consent:
                raise PermissionDenied("You do not have consent to create records for this patient.")

        elif user_role != "ADMIN":
            raise PermissionDenied("You do not have permission to create records.")

        serializer.save(created_by=self.request.user)
>>>>>>> 2347680b7caed42fb1c6f6240057f736e933ebb1


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
<<<<<<< HEAD
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
=======
        user_role = self.request.user.role
>>>>>>> 2347680b7caed42fb1c6f6240057f736e933ebb1

        if user_role == "PATIENT":
            return MedicalRecord.objects.filter(
                patient=self.request.user.patient_profile
            )

        if user_role == "ADMIN":
            if patient_id:
                return MedicalRecord.objects.select_related("created_by").filter(patient_id=patient_id)
            return MedicalRecord.objects.select_related("created_by").all()

        if user_role in ("DOCTOR", "NURSE", "BILLING_STAFF"):
            try:
                curr_staff = self.request.user.staff_profile
            except ObjectDoesNotExist:
                raise PermissionDenied("Staff profile not found.")

            if patient_id:
                has_consent = Consent.objects.filter(
                    patient_id=patient_id,
                    staff=curr_staff,
                    is_active=True,
                ).exists()

                if not has_consent:
                    raise PermissionDenied("You do not have consent to view this record.")

                return MedicalRecord.objects.select_related("created_by").filter(patient_id=patient_id)

            else:
                consented_patients = Consent.objects.filter(
                    staff=curr_staff,
                    is_active=True,
                ).values_list("patient_id", flat=True)

                return MedicalRecord.objects.select_related("created_by").filter(
                    patient_id__in=consented_patients
                )

            
            

# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement DocumentListView
#   - GET /api/v1/records/<record_id>/documents
#   - Frontend: getDocumentsByRecord(recordId)
#   - Return all documents attached to the given record
#   - Permission: IsAuthenticated + record access check
# ──────────────────────────────────────────────────────
<<<<<<< HEAD
class DocumentListUploadView(generics.ListCreateAPIView):
    """List documents for a record (GET) and upload new documents (POST)."""
=======
class DocumentListView(generics.ListAPIView):
    """List documents for a medical record."""
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        record_id = self.kwargs.get("record_id")
        record = get_object_or_404(
            MedicalRecord.objects.select_related("patient"),
            id=record_id,
        )
        user_role = self.request.user.role

        if user_role == "PATIENT":
            if self.request.user.patient_profile != record.patient:
                raise PermissionDenied("You do not have permission to view these documents.")
            return Document.objects.select_related('uploaded_by').filter(record=record_id).all()
        if user_role == "ADMIN":
            return Document.objects.select_related('uploaded_by').filter(record=record_id).all()

        if user_role in ("DOCTOR", "NURSE", "BILLING_STAFF"):
            try:
                curr_staff = self.request.user.staff_profile
            except ObjectDoesNotExist:
                raise PermissionDenied("Staff profile not found.")
            has_consent = Consent.objects.filter(
                patient=record.patient, staff=curr_staff, is_active=True
            ).exists()
            if not has_consent:
                raise PermissionDenied("You do not have consent to view these documents.")
            return Document.objects.select_related('uploaded_by').filter(record=record_id).all()

        raise PermissionDenied("You do not have permission to view these documents.")
    

# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement DocumentView (dispatches GET → DocumentListView, POST → DocumentUploadView)
class DocumentView(APIView):
    """
    Dispatches GET → DocumentListView, POST → DocumentUploadView.
    Keeps list/upload concerns separated at the same URL.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return DocumentListView.as_view()(request._request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return DocumentUploadView.as_view()(request._request, *args, **kwargs)


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
>>>>>>> 2347680b7caed42fb1c6f6240057f736e933ebb1
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = None

    def get_queryset(self):
<<<<<<< HEAD
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
=======
        return Document.objects.select_related("record","uploaded_by").all()

    def perform_create(self, serializer):
        record_id = self.kwargs.get("record_id")
        target_record = get_object_or_404(
            MedicalRecord.objects.select_related("patient"),
            id=record_id,
        )
        user_role = self.request.user.role
>>>>>>> 2347680b7caed42fb1c6f6240057f736e933ebb1

        if user_role == "PATIENT":
            if self.request.user.patient_profile != target_record.patient:
                raise PermissionDenied("You can only upload documents to your own records.")
            serializer.save(record=target_record)
            return
        if user_role == "ADMIN":
            serializer.save(record=target_record)
            return

        if user_role in ("DOCTOR", "NURSE", "BILLING_STAFF"):
            try:
                curr_staff = self.request.user.staff_profile
            except ObjectDoesNotExist:
                raise PermissionDenied("Staff profile not found.")
            has_consent = Consent.objects.filter(
                patient=target_record.patient,
                staff=curr_staff,
                is_active=True,
            ).exists()
            if not has_consent:
                raise PermissionDenied("You do not have consent to upload to this record.")
            serializer.save(record=target_record)
            return

        raise PermissionDenied("You do not have permission to upload documents.")

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
<<<<<<< HEAD
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
=======
        # TODO (Fadi): Get Document by pk
        # TODO (Fadi): Check request.user has access to the parent record
        # TODO (Fadi): If local: return FileResponse(open(path, 'rb'), as_attachment=True)
        # TODO (Fadi): If S3: generate pre-signed URL and return redirect
        # TODO (Fadi): Log DOCUMENT_DOWNLOAD in audit log
        targetDocument = get_object_or_404(
            Document.objects.select_related("record__patient"),
            id=pk,
        )
        target_record = targetDocument.record
        user_role = self.request.user.role
>>>>>>> 2347680b7caed42fb1c6f6240057f736e933ebb1

        if user_role == "PATIENT":
            if self.request.user.patient_profile != target_record.patient:
                raise PermissionDenied("You do not have permission to download this document.")

        elif user_role == "ADMIN":
            pass

        elif user_role in ("DOCTOR", "NURSE", "BILLING_STAFF"):
            try:
                curr_staff = self.request.user.staff_profile
            except ObjectDoesNotExist:
                raise PermissionDenied("Staff profile not found.")
            has_consent = Consent.objects.filter(
                patient=target_record.patient,
                staff=curr_staff,
                is_active=True,
            ).exists()
            if not has_consent:
                raise PermissionDenied("You do not have consent to access this document.")
        else:
            raise PermissionDenied("You do not have permission to download this document.")

                # Flip to True (or use settings) when S3 / django-storages is configured
        use_s3 = getattr(settings, "USE_S3_STORAGE", False)

        if use_s3:
            # TODO (Fadi): when S3 is enabled:
            # url = generate_presigned_url(bucket, targetDocument.file_path.name, ...)
            # return redirect(url)
            raise PermissionDenied("S3 download not configured yet")

        # Local: file on disk (MEDIA_ROOT)
        log_action(
            user=request.user,
            action=AuditLog.Action.DOCUMENT_DOWNLOAD,
            entity_type=AuditLog.EntityType.DOCUMENT,
            entity_id=targetDocument.id,
            request=request,
            details={
                "record_id": target_record.id,
                "file_name": targetDocument.file_name,
                "file_type": targetDocument.file_type,
            },
        )
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
        user_role = self.request.user.role

        if user_role == "ADMIN":
            return Document.objects.select_related("record__patient").all()

        if user_role in ("DOCTOR", "NURSE", "BILLING_STAFF"):
            return Document.objects.select_related("record__patient").filter(
                uploaded_by=self.request.user
            )

        return Document.objects.none()
        

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
<<<<<<< HEAD
        # Return last 10 documents
        return Document.objects.all().order_by('-created_at')[:10]
=======
        user_role = self.request.user.role

        if user_role == "ADMIN":
            return Document.objects.select_related(
                "record", "uploaded_by"
            ).all().order_by("-created_at")[:10]

        if user_role in ("DOCTOR", "NURSE", "BILLING_STAFF"):
            try:
                curr_staff = self.request.user.staff_profile
            except ObjectDoesNotExist:
                return Document.objects.none()

            consented_ids = Consent.objects.filter(
                staff=curr_staff,
                is_active=True,
            ).values_list("patient_id", flat=True)

            return Document.objects.select_related(
                "record", "uploaded_by"
            ).filter(
                record__patient_id__in=consented_ids
            ).order_by("-created_at")[:10]

        return Document.objects.none()
        
>>>>>>> 2347680b7caed42fb1c6f6240057f736e933ebb1
