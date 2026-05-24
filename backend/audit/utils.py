"""
Audit Utility — Owner: Kyrillos

Provides a helper function used by ALL apps to create audit log entries.
Import and call log_action() whenever a sensitive action occurs.

Usage example:
    from audit.utils import log_action
    from audit.models import AuditLog

    log_action(
        user=request.user,
        action=AuditLog.Action.RECORD_VIEW,
        entity_type=AuditLog.EntityType.RECORD,
        entity_id=record.id,
        request=request,
        details={"record_title": record.title},
    )
"""

from .models import AuditLog


# ──────────────────────────────────────────────────────
# TODO (Kyrillos): Implement log_action()
#   - Parameters:
#     - user: User instance (or None for system actions)
#     - action: AuditLog.Action choice
#     - entity_type: AuditLog.EntityType choice
#     - entity_id: str/int — PK of the affected entity
#     - request: DRF/Django request object (for IP and user_agent)
#     - details: dict of extra context (optional)
#   - Extract IP from request (handle X-Forwarded-For header)
#   - Extract user_agent from request headers
#   - Create AuditLog entry
#   - Should NOT raise exceptions — wrap in try/except and log errors silently
# ──────────────────────────────────────────────────────
def log_action(user, action, entity_type, entity_id, request=None, details=None):
    """
    Create an immutable audit log entry.

    Should be called after every sensitive action.
    Silently fails on error to never block the main action.
    """
    # TODO (Kyrillos): Extract ip_address from request (handle X-Forwarded-For)
    # TODO (Kyrillos): Extract user_agent from request.META.get("HTTP_USER_AGENT")
    # TODO (Kyrillos): Create AuditLog.objects.create(...)
    pass
