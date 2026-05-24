"""
Notifications Views — Owner: Kyrillos

API views aligned to frontend notificationService.js:
  GET    /notifications              → NotificationListView  (getNotifications)
  PATCH  /notifications/<id>/read    → NotificationReadView  (markAsRead)
  PATCH  /notifications/read-all     → MarkAllAsReadView     (markAllAsRead)

Internal:
  GET    /notifications/unread-count → UnreadCountView
  GET    /notifications/<id>         → NotificationDetailView
  DELETE /notifications/<id>/delete  → NotificationDeleteView
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer, NotificationCreateSerializer


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement NotificationListView
#   - GET /api/v1/notifications → list notifications for current user
#   - Filter by: notification_type, is_read, channel
#   - Order by sent_at descending (newest first)
#   - Only return notifications for request.user
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────
class NotificationListView(generics.ListAPIView):
    """List notifications for the authenticated user."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO (Kyrillos): Return notifications for request.user only
        # TODO (Kyrillos): Filter by type, is_read, channel from query params
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement NotificationDetailView
#   - GET /api/v1/notifications/<id> → retrieve notification
#   - Permission: IsAuthenticated + owner only
# ──────────────────────────────────────────────────────
class NotificationDetailView(generics.RetrieveAPIView):
    """Retrieve a single notification."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO (Kyrillos): Return notifications for request.user
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement NotificationReadView
#   - PATCH /api/v1/notifications/<id>/read
#   - Frontend: markAsRead(notificationId)
#   - Sets is_read=True, read_at=now()
#   - Returns updated notification
#   - Permission: IsAuthenticated + owner only
# ──────────────────────────────────────────────────────
class NotificationReadView(APIView):
    """Mark a single notification as read."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        # TODO (Kyrillos): Get notification for request.user, set is_read=True
        # TODO (Kyrillos): Set read_at=timezone.now()
        # TODO (Kyrillos): Return updated notification data
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement MarkAllAsReadView
#   - PATCH /api/v1/notifications/read-all
#   - Frontend: markAllAsRead()
#   - Mark ALL unread notifications for request.user as read
#   - Returns {"updated_count": n}
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────
class MarkAllAsReadView(APIView):
    """Mark all notifications as read for the current user."""
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        # TODO (Kyrillos): Bulk update: Notification.objects.filter(user=request.user, is_read=False)
        # TODO (Kyrillos): Set is_read=True, read_at=now() for all
        # TODO (Kyrillos): Return {"updated_count": count}
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement UnreadCountView
#   - GET /api/v1/notifications/unread-count
#   - Return {"unread_count": <int>}
#   - Lightweight endpoint for navbar badge
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────
class UnreadCountView(APIView):
    """Get count of unread notifications (for badge display)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO (Kyrillos): Count unread notifications for request.user
        # TODO (Kyrillos): Return {"unread_count": count}
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement NotificationDeleteView
#   - DELETE /api/v1/notifications/<id>/delete → delete a notification
#   - Permission: IsAuthenticated + owner only
# ──────────────────────────────────────────────────────
class NotificationDeleteView(generics.DestroyAPIView):
    """Delete a notification."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO (Kyrillos): Return notifications for request.user
        pass
