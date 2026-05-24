"""
Audit URLs — Owner: Kyrillos

Aligned to frontend auditService.js call patterns.

Frontend calls:
  GET    /audit-logs                  → AuditLogListView  (getAuditLogs)

Internal (admin):
  GET    /audit-logs/stats            → AuditLogStatsView
  GET    /audit-logs/export           → AuditLogExportView
  GET    /audit-logs/<id>             → AuditLogDetailView
"""

from django.urls import path
from . import views

app_name = "audit"

urlpatterns = [
    path("", views.AuditLogListView.as_view(), name="audit-list"),
    path("stats", views.AuditLogStatsView.as_view(), name="audit-stats"),
    path("export", views.AuditLogExportView.as_view(), name="audit-export"),
    path("<int:pk>", views.AuditLogDetailView.as_view(), name="audit-detail"),
]
