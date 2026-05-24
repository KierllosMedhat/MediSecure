"""
Shared permission classes for the MediSecure API.
Implemented by Abanob, used by all team members.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Allows access only to ADMIN users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "ADMIN"
        )


class IsDoctor(BasePermission):
    """Allows access only to DOCTOR users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "DOCTOR"
        )


class IsNurse(BasePermission):
    """Allows access only to NURSE users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "NURSE"
        )


class IsPatient(BasePermission):
    """Allows access only to PATIENT users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "PATIENT"
        )


class IsBillingStaff(BasePermission):
    """Allows access only to BILLING_STAFF users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "BILLING_STAFF"
        )


class IsStaffMember(BasePermission):
    """Allows access to any staff role (DOCTOR, NURSE, BILLING_STAFF, ADMIN)."""

    STAFF_ROLES = {"DOCTOR", "NURSE", "BILLING_STAFF", "ADMIN"}

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in self.STAFF_ROLES
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission: allows access if the user owns the object
    (obj.user == request.user) or is an ADMIN.
    """

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == "ADMIN":
            return True
        owner = getattr(obj, "user", None)
        return owner == request.user


class IsAdminOrReadOnly(BasePermission):
    """Allows safe (read) methods to any authenticated user; write only to ADMIN."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role == "ADMIN"
