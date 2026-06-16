"""
Hospitals Serializers — Owner: Fadi
"""

from rest_framework import serializers
from .models import Hospital


# ──────────────────────────────────────────────────────
# TODO (Fadi): Implement HospitalSerializer
#   - Fields: id, name, address, email, phone, subscription,
#             is_active, staff_count, created_at, updated_at
#   - staff_count: computed field (count of staff in this hospital)
#   - Validate email uniqueness
#   - Validate phone format
# ──────────────────────────────────────────────────────
class HospitalSerializer(serializers.ModelSerializer):
    staff_count = serializers.SerializerMethodField()

    class Meta:
        model = Hospital
        fields = [
            "id", "name", "address", "email", "phone",
            "subscription", "is_active", "staff_count",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_staff_count(self, obj):
        # TODO (Fadi): Return obj.staff_members.count()
        return obj.staff_members.count()
