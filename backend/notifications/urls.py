"""
Notifications URLs — Owner: Kyrillos

Aligned to frontend notificationService.js call patterns.

Frontend calls:
  GET    /notifications                    → NotificationListView   (getNotifications)
  PATCH  /notifications/<id>/read          → NotificationReadView   (markAsRead)
  PATCH  /notifications/read-all           → MarkAllAsReadView      (markAllAsRead)

Internal:
  GET    /notifications/unread-count       → UnreadCountView
  DELETE /notifications/<id>/delete        → NotificationDeleteView
"""

from django.urls import path
from . import views

app_name = "notifications"

urlpatterns = [
    path("", views.NotificationListView.as_view(), name="notification-list"),

    # Frontend calls: PATCH /notifications/read-all
    path("read-all", views.MarkAllAsReadView.as_view(), name="mark-all-read"),

    # Internal badge count
    path("unread-count", views.UnreadCountView.as_view(), name="unread-count"),

    # Frontend calls: PATCH /notifications/<id>/read
    path("<int:pk>/read", views.NotificationReadView.as_view(), name="notification-read"),

    path("<int:pk>", views.NotificationDetailView.as_view(), name="notification-detail"),
    path("<int:pk>/delete", views.NotificationDeleteView.as_view(), name="notification-delete"),
]
