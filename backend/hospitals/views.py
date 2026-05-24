"""
Hospitals Views — Owner: Fadi

API views for hospital CRUD (admin only) and listing.
"""

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsAdmin

from .models import Hospital
from .serializers import HospitalSerializer


# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement HospitalListCreateView
#   - GET  /api/v1/hospitals/ → list all hospitals
#   - POST /api/v1/hospitals/ → create a new hospital (admin only)
#   - Support search by name, filter by subscription tier
#   - GET permission: IsAuthenticated (any staff can view)
#   - POST permission: IsAuthenticated + IsAdmin
# ──────────────────────────────────────────────────────
class HospitalListCreateView(generics.ListCreateAPIView):
    """List all hospitals or create a new one."""
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO (Fadi): Return hospitals with search/filter
        pass


# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement HospitalDetailView
#   - GET    /api/v1/hospitals/<id>/ → retrieve hospital detail
#   - PUT    /api/v1/hospitals/<id>/ → update hospital (admin only)
#   - DELETE /api/v1/hospitals/<id>/ → deactivate hospital (admin only)
#   - On DELETE: soft-delete (set is_active=False), don't hard delete
# ──────────────────────────────────────────────────────
class HospitalDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or deactivate a hospital."""
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO (Fadi): Return Hospital.objects.all()
        pass

    def perform_destroy(self, instance):
        # TODO (Fadi): Soft-delete — set is_active=False instead of deleting
        pass
