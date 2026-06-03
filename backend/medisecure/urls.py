"""
MediSecure Root URL Configuration

All API endpoints are namespaced under /api/v1/.

Patient-scoped routes (/patients/<id>/records/* and /patients/<id>/consents/*)
are wired here because they span two apps (records & consent) under the
patients/ prefix — matching the frontend service call patterns exactly.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Patient-scoped record views (owned by Fadi)
from records.views import MedicalRecordListCreateView, MedicalRecordDetailView

# Patient-scoped consent views (owned by Abdullah)
from consent.views import ConsentListView, ConsentGrantView, ConsentRevokeView

# Document download (owned by Fadi) — lives under /documents/<id>/download
from records.views import DocumentDownloadView
from patients.views import PatientListView

urlpatterns = [
    # Django Admin
    path("admin/", admin.site.urls),

    # ── Abanob ───────────────────────────────────────────
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/patients", PatientListView.as_view(), name="patient-list-no-slash"),
    path("api/v1/patients/", include("patients.urls")),

    # ── Fadi ─────────────────────────────────────────────
    path("api/v1/records/", include("records.urls")),
    path("api/v1/hospitals/", include("hospitals.urls")),

    # ── Abdullah ─────────────────────────────────────────
    path("api/v1/consents/", include("consent.urls")),
    path("api/v1/payments/", include("payments.urls")),

    # ── Kyrillos ─────────────────────────────────────────
    path("api/v1/staff/", include("staff.urls")),
    path("api/v1/appointments/", include("appointments.urls")),
    path("api/v1/notifications/", include("notifications.urls")),
    path("api/v1/audit-logs/", include("audit.urls")),

    # ── Patient-scoped Routes ────────────────────────────
    # Records under a patient — frontend: GET /patients/<id>/records
    # (Fadi's views, mounted under patients/ prefix)
    path(
        "api/v1/patients/<int:patient_id>/records",
        MedicalRecordListCreateView.as_view(),
        name="patient-records-list",
    ),
    path(
        "api/v1/patients/<int:patient_id>/records/<int:pk>",
        MedicalRecordDetailView.as_view(),
        name="patient-record-detail",
    ),

    # Consents under a patient — frontend: GET/POST/DELETE /patients/<id>/consents
    # (Abdullah's views, mounted under patients/ prefix)
    path(
        "api/v1/patients/<int:patient_id>/consents",
        ConsentListView.as_view(),
        name="patient-consent-list",
    ),
    path(
        "api/v1/patients/<int:patient_id>/consents",
        ConsentGrantView.as_view(),
        name="patient-consent-grant",
    ),
    path(
        "api/v1/patients/<int:patient_id>/consents/<int:pk>",
        ConsentRevokeView.as_view(),
        name="patient-consent-revoke",
    ),

    # Document download — frontend: GET /documents/<id>/download
    path(
        "api/v1/documents/<int:pk>/download",
        DocumentDownloadView.as_view(),
        name="document-download",
    ),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
