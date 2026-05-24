"""
Audit Utility — Implemented by Kyrillos

Call log_action() from any view whenever a sensitive action occurs.

Usage:
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

import logging

from .models import AuditLog

logger = logging.getLogger(__name__)


def _get_client_ip(request):
    """Extract the real client IP, respecting X-Forwarded-For from proxies."""
    if request is None:
        return None
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        # X-Forwarded-For: client, proxy1, proxy2 → take the first
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def log_action(user, action, entity_type, entity_id, request=None, details=None):
    """
    Create an immutable audit log entry.

    Never raises exceptions — all errors are logged silently so that
    a logging failure never blocks the primary user action.

    Args:
        user:        User instance (or None for system actions).
        action:      AuditLog.Action choice string.
        entity_type: AuditLog.EntityType choice string.
        entity_id:   PK of the affected entity (int or str).
        request:     Django/DRF request object (optional, used for IP/UA).
        details:     dict of extra context (e.g., changed fields).
    """
    try:
        ip = _get_client_ip(request)
        ua = ""
        if request is not None:
            ua = request.META.get("HTTP_USER_AGENT", "")

        AuditLog.objects.create(
            user=user,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id),
            ip_address=ip,
            user_agent=ua,
            details=details or {},
        )
    except Exception as exc:  # pragma: no cover
        # Log the error but never surface it to the caller
        logger.error(
            "AuditLog creation failed: %s | action=%s entity=%s id=%s",
            exc, action, entity_type, entity_id,
        )
