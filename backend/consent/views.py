"""
Consent Views — Owner: Abdullah

API views aligned to frontend consentService.js:
  GET    /patients/<id>/consents           -> ConsentListView    (getConsents)
  POST   /patients/<id>/consents           -> ConsentGrantView   (grantConsent)
  DELETE /patients/<id>/consents/<cid>     -> ConsentRevokeView  (revokeConsent)
  POST   /patients/<id>/consents/<cid>/approve -> ConsentApproveView
  POST   /patients/<id>/consents/<cid>/deny    -> ConsentDenyView

Staff views:
  POST   /consents/request                 -> ConsentRequestView

Admin/utility:
  GET    /consents/check                   -> ConsentCheckView
  GET    /consents/<id>                    -> ConsentDetailView
"""

from rest_framework import generics, status as drf_status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.apps import apps

from .models import Consent
from .serializers import (
    ConsentSerializer,
    ConsentGrantSerializer,
    ConsentRevokeSerializer,
    ConsentRequestSerializer,
)


class ConsentListGrantView(generics.ListCreateAPIView):
    """List consents (GET) or grant a new one (POST) for a specific patient."""
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ConsentGrantSerializer
        return ConsentSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        patient_id = self.kwargs.get("patient_id")
        Patient = apps.get_model('patients', 'Patient')
        
        if str(patient_id).lower() == "me":
            patient = get_object_or_404(Patient, user=self.request.user)
        else:
            patient = get_object_or_404(Patient, id=patient_id)
            
        context['patient'] = patient
        return context

    def get_queryset(self):
        patient_id = self.kwargs.get("patient_id")
        Patient = apps.get_model('patients', 'Patient')
        
        if str(patient_id).lower() == "me":
            patient = get_object_or_404(Patient, user=self.request.user)
        else:
            patient = get_object_or_404(Patient, id=patient_id)

        is_owner = getattr(patient, 'user', None) == self.request.user
        is_staff = getattr(self.request.user, 'is_staff', False)
        
        if not (is_owner or is_staff):
            raise PermissionDenied("You do not have permission to view these consent records.")

        queryset = Consent.objects.filter(patient=patient)

        status_param = self.request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        return queryset

    def perform_create(self, serializer):
        patient = serializer.context.get('patient')

        if getattr(patient, 'user', None) != self.request.user:
            raise PermissionDenied("You can only grant consent for your own records.")

        consent = serializer.save()
        
        from audit.utils import log_action
        from audit.models import AuditLog
        log_action(
            user=self.request.user,
            action=AuditLog.Action.CONSENT_GRANT,
            entity_type=AuditLog.EntityType.CONSENT,
            entity_id=consent.id,
            request=self.request,
            details={"purpose": consent.purpose, "staff_id": consent.staff.id}
        )

        from notifications.services import create_notification
        from notifications.models import Notification
        
        create_notification(
            user=consent.staff.user,
            notification_type=Notification.NotificationType.CONSENT,
            subject="Patient Consent Granted",
            content=f"Patient {consent.patient.user.first_name} {consent.patient.user.last_name} has granted you consent for: {consent.purpose}."
        )


class ConsentRevokeView(APIView):
    """Revoke a granted or pending consent (soft-delete, patient-scoped)."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, patient_id, pk):
        if str(patient_id).lower() == "me":
            Patient = apps.get_model('patients', 'Patient')
            patient = get_object_or_404(Patient, user=request.user)
            actual_patient_id = patient.id
        else:
            actual_patient_id = patient_id

        consent = get_object_or_404(Consent, pk=pk, patient_id=actual_patient_id)

        if getattr(consent.patient, 'user', None) != request.user:
            raise PermissionDenied("You can only revoke your own consents.")

        serializer = ConsentRevokeSerializer(consent, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        from audit.utils import log_action
        from audit.models import AuditLog
        log_action(
            user=request.user,
            action=AuditLog.Action.CONSENT_REVOKE,
            entity_type=AuditLog.EntityType.CONSENT,
            entity_id=consent.id,
            request=request,
            details={"purpose": consent.purpose, "staff_id": consent.staff.id}
        )

        from notifications.services import create_notification
        from notifications.models import Notification
        
        create_notification(
            user=consent.staff.user,
            notification_type=Notification.NotificationType.CONSENT,
            subject="Patient Consent Revoked",
            content=f"Patient {consent.patient.user.first_name} {consent.patient.user.last_name} has revoked your consent for: {consent.purpose}."
        )

        return Response({
            "message": "Consent revoked",
            "revoked_at": consent.revoked_at
        }, status=drf_status.HTTP_200_OK)


class ConsentApproveView(APIView):
    """Approve a PENDING consent."""
    permission_classes = [IsAuthenticated]

    def post(self, request, patient_id, pk):
        if str(patient_id).lower() == "me":
            Patient = apps.get_model('patients', 'Patient')
            patient = get_object_or_404(Patient, user=request.user)
            actual_patient_id = patient.id
        else:
            actual_patient_id = patient_id

        consent = get_object_or_404(Consent, pk=pk, patient_id=actual_patient_id)

        if getattr(consent.patient, 'user', None) != request.user:
            raise PermissionDenied("You can only approve your own consents.")

        if consent.status != Consent.Status.PENDING:
            return Response({"detail": "Only pending requests can be approved."}, status=drf_status.HTTP_400_BAD_REQUEST)

        consent.status = Consent.Status.GRANTED
        consent.save(update_fields=['status'])

        from notifications.services import create_notification
        from notifications.models import Notification
        
        create_notification(
            user=consent.staff.user,
            notification_type=Notification.NotificationType.CONSENT,
            subject="Access Request Approved",
            content=f"Patient {consent.patient.user.first_name} {consent.patient.user.last_name} has approved your access request for: {consent.purpose}."
        )

        return Response({"message": "Consent approved"}, status=drf_status.HTTP_200_OK)


class ConsentDenyView(APIView):
    """Deny a PENDING consent."""
    permission_classes = [IsAuthenticated]

    def post(self, request, patient_id, pk):
        if str(patient_id).lower() == "me":
            Patient = apps.get_model('patients', 'Patient')
            patient = get_object_or_404(Patient, user=request.user)
            actual_patient_id = patient.id
        else:
            actual_patient_id = patient_id

        consent = get_object_or_404(Consent, pk=pk, patient_id=actual_patient_id)

        if getattr(consent.patient, 'user', None) != request.user:
            raise PermissionDenied("You can only deny your own consents.")

        if consent.status != Consent.Status.PENDING:
            return Response({"detail": "Only pending requests can be denied."}, status=drf_status.HTTP_400_BAD_REQUEST)

        consent.status = Consent.Status.DENIED
        consent.save(update_fields=['status'])

        from notifications.services import create_notification
        from notifications.models import Notification
        
        create_notification(
            user=consent.staff.user,
            notification_type=Notification.NotificationType.CONSENT,
            subject="Access Request Denied",
            content=f"Patient {consent.patient.user.first_name} {consent.patient.user.last_name} has denied your access request for: {consent.purpose}."
        )

        return Response({"message": "Consent denied"}, status=drf_status.HTTP_200_OK)


class ConsentRequestView(generics.CreateAPIView):
    """Staff requests consent from a patient."""
    serializer_class = ConsentRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if not hasattr(self.request.user, 'staff_profile'):
            raise PermissionDenied("Only staff members can request consent.")
        context['staff'] = self.request.user.staff_profile
        return context

    def perform_create(self, serializer):
        consent = serializer.save()

        from notifications.services import create_notification
        from notifications.models import Notification
        
        create_notification(
            user=consent.patient.user,
            notification_type=Notification.NotificationType.CONSENT,
            subject="New Access Request",
            content=f"Staff member {consent.staff.user.first_name} {consent.staff.user.last_name} has requested access to your records for: {consent.purpose}."
        )


class ConsentDetailView(generics.RetrieveAPIView):
    """Retrieve a specific consent record (admin/staff)."""
    serializer_class = ConsentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self.request.user, 'is_staff', False):
            return Consent.objects.all()
        raise PermissionDenied("Only staff members can access detailed consent records.")


class ConsentCheckView(APIView):
    """Check if an active consent exists for a patient-staff-purpose combo."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient_id = request.query_params.get("patient_id")
        staff_id = request.query_params.get("staff_id")
        purpose = request.query_params.get("purpose")

        if not all([patient_id, staff_id, purpose]):
            return Response(
                {"error": "Missing required parameters: patient_id, staff_id, purpose"},
                status=drf_status.HTTP_400_BAD_REQUEST
            )

        consent = Consent.objects.filter(
            patient_id=patient_id,
            staff_id=staff_id,
            purpose=purpose
        ).order_by('-granted_at').first()

        if consent:
            return Response({
                "status": consent.status,
                "consent_id": consent.id
            }, status=drf_status.HTTP_200_OK)
            
        return Response({
            "status": "NONE",
            "consent_id": None
        }, status=drf_status.HTTP_200_OK)