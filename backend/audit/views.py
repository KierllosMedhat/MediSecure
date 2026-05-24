"""
Audit Views — Owner: Kyrillos

API views for audit log browsing and export (admin only).
"""

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsAdmin

from .models import AuditLog
from .serializers import AuditLogSerializer


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement AuditLogListView
#   - GET /api/v1/audit-logs/ → list all audit logs (admin only)
#   - Filter by: user_id, action, entity_type, entity_id
#   - Filter by date range: timestamp__gte, timestamp__lte
#   - Search by: user email, ip_address
#   - Order by: timestamp descending (newest first)
#   - Paginate results (use StandardPagination, 50 per page for audit)
#   - Permission: IsAuthenticated + IsAdmin
# ──────────────────────────────────────────────────────
class AuditLogListView(generics.ListAPIView):
    """List audit logs with filtering — admin only."""
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO (Kyrillos): Return AuditLog.objects.select_related("user")
        # TODO (Kyrillos): Apply filters: user_id, action, entity_type, entity_id
        # TODO (Kyrillos): Apply date range filter: timestamp__gte, timestamp__lte
        # TODO (Kyrillos): Apply search: user__email, ip_address
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement AuditLogDetailView
#   - GET /api/v1/audit-logs/<id>/ → retrieve single audit entry
#   - Permission: IsAuthenticated + IsAdmin
# ──────────────────────────────────────────────────────
class AuditLogDetailView(generics.RetrieveAPIView):
    """Retrieve a single audit log entry."""
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO (Kyrillos): Return AuditLog.objects.all()
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement AuditLogStatsView
#   - GET /api/v1/audit-logs/stats/ → summary statistics
#   - Return:
#     - total_actions_today: count of today's logs
#     - actions_by_type: {action: count} breakdown
#     - top_users: top 5 most active users
#     - recent_failed_logins: count of LOGIN_FAIL in last 24h
#   - Permission: IsAuthenticated + IsAdmin
# ──────────────────────────────────────────────────────
class AuditLogStatsView(APIView):
    """Aggregate statistics from audit logs for admin dashboard."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO (Kyrillos): Aggregate stats using Django ORM annotations
        # TODO (Kyrillos): Count today's actions
        # TODO (Kyrillos): Group by action type
        # TODO (Kyrillos): Find top 5 users by action count
        pass


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement AuditLogExportView
#   - GET /api/v1/audit-logs/export/?format=csv&start=<date>&end=<date>
#   - Export audit logs as CSV for compliance reporting
#   - Filter by date range
#   - Return as file download (Content-Disposition: attachment)
#   - Permission: IsAuthenticated + IsAdmin
# ──────────────────────────────────────────────────────
class AuditLogExportView(APIView):
    """Export audit logs as CSV for compliance reporting."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO (Kyrillos): Parse start/end date params
        # TODO (Kyrillos): Query audit logs in date range
        # TODO (Kyrillos): Generate CSV using Python csv module
        # TODO (Kyrillos): Return StreamingHttpResponse with CSV content
        pass
