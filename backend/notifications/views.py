"""
Notifications Views — Implemented by Kyrillos
"""

from django.utils import timezone

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Notification
from .serializers import NotificationSerializer, NotificationCreateSerializer


class NotificationListView(generics.ListAPIView):
    """
    GET /notifications  — List all notifications for the authenticated user.

    Optional filters: ?notification_type=APPOINTMENT&is_read=false
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["notification_type", "is_read", "channel"]
    ordering_fields = ["sent_at"]
    ordering = ["-sent_at"]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationDetailView(generics.RetrieveAPIView):
    """
    GET /notifications/<id>  — Retrieve a notification.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationReadView(APIView):
    """
    PATCH /notifications/<id>/read  — Mark a single notification as read.
    Frontend: markAsRead(notificationId)
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response(
                {"detail": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=["is_read", "read_at"])

        return Response(
            NotificationSerializer(notification).data,
            status=status.HTTP_200_OK,
        )


class MarkAllAsReadView(APIView):
    """
    PATCH /notifications/read-all  — Mark ALL unread notifications as read.
    Frontend: markAllAsRead()
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        now = timezone.now()
        updated_count = Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).update(is_read=True, read_at=now)

        return Response(
            {"updated_count": updated_count},
            status=status.HTTP_200_OK,
        )


class UnreadCountView(APIView):
    """
    GET /notifications/unread-count  — Lightweight badge count.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).count()
        return Response({"unread_count": count})


class NotificationDeleteView(generics.DestroyAPIView):
    """
    DELETE /notifications/<id>/delete  — Delete a notification.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
