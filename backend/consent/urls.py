"""
Consent URLs — Owner: Abdullah

Aligned to frontend consentService.js call patterns.

Frontend calls:
  GET    /patients/<id>/consents              → ConsentListView
  POST   /patients/<id>/consents             → ConsentGrantView
  DELETE /patients/<id>/consents/<cid>       → ConsentRevokeView

Note: All consent routes are patient-scoped (/patients/<id>/consents/*).
      They are registered in the ROOT urls.py under the patients/ prefix.
      This file handles the /consents/* admin/check routes only.

Admin/utility routes:
  GET    /consents/check                     → ConsentCheckView
  GET    /consents/<id>                      → ConsentDetailView
"""

from django.urls import path
from . import views

app_name = "consent"

urlpatterns = [
    path("check", views.ConsentCheckView.as_view(), name="consent-check"),
    path("<int:pk>", views.ConsentDetailView.as_view(), name="consent-detail"),
]
