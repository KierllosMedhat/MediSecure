import json
from audit.utils import log_action
from audit.models import AuditLog

class AuditLogMiddleware:
    """
    Middleware to automatically generate audit logs for state-modifying requests.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Only log authenticated, state-modifying requests
        if request.user.is_authenticated and request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            # Basic mapping of paths to actions
            action = AuditLog.Action.OTHER
            entity_type = AuditLog.EntityType.USER
            entity_id = "0"
            details = {"path": request.path, "method": request.method, "status_code": response.status_code}
            
            if "staff" in request.path:
                action = AuditLog.Action.STAFF_CREATE if request.method == "POST" else AuditLog.Action.STAFF_UPDATE
                entity_type = AuditLog.EntityType.STAFF
            elif "appointments" in request.path:
                action = AuditLog.Action.APPOINTMENT_CREATE if request.method == "POST" else AuditLog.Action.APPOINTMENT_UPDATE
                entity_type = AuditLog.EntityType.APPOINTMENT
            elif "auth" in request.path:
                action = AuditLog.Action.LOGIN
                entity_type = AuditLog.EntityType.USER
                
            # Log action silently
            log_action(
                user=request.user,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                request=request,
                details=details
            )

        return response
