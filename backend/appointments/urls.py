"""
Appointments URLs — Owner: Kyrillos

Aligned to frontend appointmentService.js call patterns.

Frontend calls:
  GET    /appointments                    → AppointmentListCreateView (getAppointments)
  GET    /appointments/<id>               → AppointmentDetailView     (getAppointmentById)
  POST   /appointments                    → AppointmentListCreateView (createAppointment)
  PATCH  /appointments/<id>               → AppointmentDetailView     (cancelAppointment)

Internal:
  PATCH  /appointments/<id>/status        → AppointmentStatusView
  GET    /appointments/available-slots    → AvailableSlotsView
"""

from django.urls import path
from . import views

app_name = "appointments"

urlpatterns = [
    path("", views.AppointmentListCreateView.as_view(), name="appointment-list-create"),
    path("available-slots", views.AvailableSlotsView.as_view(), name="available-slots"),
    path("<int:pk>", views.AppointmentDetailView.as_view(), name="appointment-detail"),
    path("<int:pk>/status", views.AppointmentStatusView.as_view(), name="appointment-status"),
]
