"""
Shared permission classes for the MediSecure API.

Owner: Abanob (primary), used by all team members.

These are role-based permission classes that map to the User.Role choices.
Import and use them in your views:
    from core.permissions import IsAdmin, IsDoctor, IsPatient
"""

from rest_framework.permissions import BasePermission


# TODO (Abanob): Implement IsAdmin permission
#   - Allow access only if request.user.role == "ADMIN"
class IsAdmin(BasePermission):
    """Allows access only to ADMIN users."""

    def has_permission(self, request, view):
        # TODO (Abanob): Check request.user.role == "ADMIN"
        pass


# TODO (Abanob): Implement IsDoctor permission
class IsDoctor(BasePermission):
    """Allows access only to DOCTOR users."""

    def has_permission(self, request, view):
        # TODO (Abanob): Check request.user.role == "DOCTOR"
        pass


# TODO (Abanob): Implement IsNurse permission
class IsNurse(BasePermission):
    """Allows access only to NURSE users."""

    def has_permission(self, request, view):
        # TODO (Abanob): Check request.user.role == "NURSE"
        pass


# TODO (Abanob): Implement IsPatient permission
class IsPatient(BasePermission):
    """Allows access only to PATIENT users."""

    def has_permission(self, request, view):
        # TODO (Abanob): Check request.user.role == "PATIENT"
        pass


# TODO (Abanob): Implement IsBillingStaff permission
class IsBillingStaff(BasePermission):
    """Allows access only to BILLING_STAFF users."""

    def has_permission(self, request, view):
        # TODO (Abanob): Check request.user.role == "BILLING_STAFF"
        pass


# TODO (Abanob): Implement IsStaffMember permission
class IsStaffMember(BasePermission):
    """Allows access to any staff role (DOCTOR, NURSE, BILLING_STAFF, ADMIN)."""

    def has_permission(self, request, view):
        # TODO (Abanob): Check request.user.role in ["DOCTOR", "NURSE", "BILLING_STAFF", "ADMIN"]
        pass


# TODO (Abanob): Implement IsOwnerOrAdmin permission
class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission: allows access if the user owns the object or is an ADMIN.
    Requires the object to have a 'user' attribute or be a User instance.
    """

    def has_object_permission(self, request, view, obj):
        # TODO (Abanob): Check if obj.user == request.user or request.user.role == "ADMIN"
        pass
