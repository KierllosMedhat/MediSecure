"""
Hospitals URLs — Owner: Fadi

Aligned to frontend hospitalService.js call patterns.

Frontend calls:
  GET    /hospitals             → HospitalListCreateView
  GET    /hospitals/<id>        → HospitalDetailView
"""

from django.urls import path
from . import views

app_name = "hospitals"

urlpatterns = [
    path("", views.HospitalListCreateView.as_view(), name="hospital-list-create"),
    path("<int:pk>", views.HospitalDetailView.as_view(), name="hospital-detail"),
]
