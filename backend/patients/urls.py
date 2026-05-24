"""
Patients URLs — Owner: Abanob

Aligned to frontend patientService.js call patterns.

Frontend calls:
  GET    /patients/profile          → PatientProfileView
  PUT    /patients/profile          → PatientProfileView
  GET    /patients/dashboard        → PatientDashboardView
  GET    /patients/<id>             → PatientDetailView
  GET    /patients                  → PatientListView
"""

from django.urls import path
from . import views

app_name = "patients"

urlpatterns = [
    path("", views.PatientListView.as_view(), name="patient-list"),
    path("profile", views.PatientProfileView.as_view(), name="patient-profile"),
    path("dashboard", views.PatientDashboardView.as_view(), name="patient-dashboard"),
    path("<int:pk>", views.PatientDetailView.as_view(), name="patient-detail"),
]
