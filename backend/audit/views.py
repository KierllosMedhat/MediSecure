"""
Audit Views — Implemented by Kyrillos

All views are admin-only. Audit logs are immutable (no create/update/delete).
"""

import csv
import io

from django.db.models import Count
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.http import StreamingHttpResponse

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.permissions import IsAdmin

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(generics.ListAPIView):
    """
    GET /audit-logs  — List audit logs with rich filtering (admin only).

    Supports:
      ?user_id=<id>         Filter by user
      ?action=RECORD_VIEW   Filter by action type
      ?entity_type=RECORD   Filter by entity type
      ?entity_id=<id>       Filter by entity PK
      ?from_date=YYYY-MM-DD Start of date range
      ?to_date=YYYY-MM-DD   End of date range
      ?search=<email|ip>    Search by email or IP address
    """
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["action", "entity_type", "entity_id"]
    search_fields = ["user__email", "ip_address"]
    ordering_fields = ["timestamp"]
    ordering = ["-timestamp"]

    def get_queryset(self):
        qs = AuditLog.objects.select_related("user")

        user_id = self.request.query_params.get("user_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if user_id:
            qs = qs.filter(user_id=user_id)
        if from_date:
            qs = qs.filter(timestamp__date__gte=from_date)
        if to_date:
            qs = qs.filter(timestamp__date__lte=to_date)

        return qs


class AuditLogDetailView(generics.RetrieveAPIView):
    """
    GET /audit-logs/<id>  — Retrieve a single audit log entry (admin only).
    """
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = AuditLog.objects.select_related("user").all()


class AuditLogStatsView(APIView):
    """
    GET /audit-logs/stats  — Aggregate audit statistics (admin only).

    Returns:
      total_actions_today:   int
      actions_by_type:       [{action, count}]
      top_users:             [{user_email, count}] (top 5)
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        today = timezone.now().date()

        total_today = AuditLog.objects.filter(timestamp__date=today).count()

        actions_by_type = list(
            AuditLog.objects.values("action")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        top_users = list(
            AuditLog.objects.filter(user__isnull=False)
            .values("user__email")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )
        # Rename key for a cleaner response
        top_users = [
            {"user_email": row["user__email"], "count": row["count"]}
            for row in top_users
        ]

        return Response({
            "total_actions_today": total_today,
            "actions_by_type": actions_by_type,
            "top_users": top_users,
        })


class AuditLogExportView(APIView):
    """
    GET /audit-logs/export?start=YYYY-MM-DD&end=YYYY-MM-DD

    Export audit logs as a streaming CSV file (admin only).
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    CSV_COLUMNS = [
        "id", "timestamp", "user_email", "action",
        "entity_type", "entity_id", "ip_address", "user_agent", "details",
    ]

    def get(self, request):
        start = request.query_params.get("start")
        end = request.query_params.get("end")

        qs = AuditLog.objects.select_related("user").order_by("timestamp")

        if start:
            parsed = parse_date(start)
            if parsed:
                qs = qs.filter(timestamp__date__gte=parsed)
        if end:
            parsed = parse_date(end)
            if parsed:
                qs = qs.filter(timestamp__date__lte=parsed)

        response = StreamingHttpResponse(
            self._generate_csv(qs),
            content_type="text/csv",
        )
        filename = f"audit_export_{timezone.now().strftime('%Y%m%d_%H%M%S')}.csv"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response

    def _generate_csv(self, queryset):
        """Generator that yields CSV rows one at a time (memory-efficient)."""
        buffer = io.StringIO()
        writer = csv.DictWriter(buffer, fieldnames=self.CSV_COLUMNS)

        # Header row
        writer.writeheader()
        yield buffer.getvalue()
        buffer.seek(0)
        buffer.truncate()

        # Data rows
        for log in queryset.iterator(chunk_size=500):
            writer.writerow({
                "id": log.id,
                "timestamp": log.timestamp.isoformat(),
                "user_email": log.user.email if log.user else "System",
                "action": log.action,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "ip_address": log.ip_address or "",
                "user_agent": log.user_agent,
                "details": log.details,
            })
            yield buffer.getvalue()
            buffer.seek(0)
            buffer.truncate()
