"""
Staff URLs — Owner: Kyrillos

Aligned to frontend staffService.js call patterns.

Frontend calls:
  GET    /staff                    → StaffListView      (getStaffList)
  GET    /staff/<id>               → StaffDetailView    (getStaffById)
  POST   /staff                    → StaffCreateView    (createStaff)
  PUT    /staff/<id>               → StaffDetailView    (updateStaff)
  PATCH  /staff/<id>/deactivate    → StaffDeactivateView (deactivateStaff)

Internal:
  GET    /staff/dashboard          → StaffDashboardView
"""

from django.urls import path
from . import views

app_name = "staff"

urlpatterns = [
    # List (GET) + Create (POST) on the same endpoint — matches frontend
    path("", views.StaffListCreateView.as_view(), name="staff-list-create"),

    # Dashboard
    path("dashboard", views.StaffDashboardView.as_view(), name="staff-dashboard"),

    # Detail + Update
    path("<int:pk>", views.StaffDetailView.as_view(), name="staff-detail"),

    # Deactivate — frontend: PATCH /staff/<id>/deactivate
    path("<int:pk>/deactivate", views.StaffDeactivateView.as_view(), name="staff-deactivate"),
]
