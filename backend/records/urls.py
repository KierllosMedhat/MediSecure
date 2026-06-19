"""
Records URLs — Owner: Fadi

Aligned to frontend recordsService.js call patterns.

Frontend calls:
  POST   /records                          → MedicalRecordListCreateView (createRecord)
  GET    /records/<id>/documents           → DocumentListView (getDocumentsByRecord)
  POST   /records/<id>/documents           → DocumentUploadView (uploadDocument)
  GET    /records/recent-uploads           → RecentUploadsView

Patient-scoped routes (registered in root urls.py):
  GET    /patients/<id>/records            → MedicalRecordListCreateView (getRecords)
  GET    /patients/<id>/records/<recordId> → MedicalRecordDetailView (getRecordById)

Document download (registered in root urls.py):
  GET    /documents/<id>/download          → DocumentDownloadView (downloadDocument)
"""

from django.urls import path
from . import views

app_name = "records"

urlpatterns = [
    # Create record (frontend: POST /records)
    path("", views.MedicalRecordListCreateView.as_view(), name="record-create"),

    # Record detail
    path("<int:pk>", views.MedicalRecordDetailView.as_view(), name="record-detail"),

    # Documents under a record
    # GET  /records/<id>/documents → list documents
    # POST /records/<id>/documents → upload document
    path(
        "<int:record_id>/documents",
        views.DocumentView.as_view(),
        name="document-list-upload",
    ),

    # Recent uploads widget
    path("recent-uploads", views.RecentUploadsView.as_view(), name="recent-uploads"),
]
