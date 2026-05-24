"""
Payments Serializers — Owner: Abdullah

Serializers for payment initiation, status tracking, and receipt generation.
"""

from rest_framework import serializers
from .models import Payment


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement PaymentSerializer
#   - Fields: all Payment model fields + patient_name
#   - Read-only: id, status, gateway_reference_id, receipt_url,
#                paid_at, created_at, updated_at
#   - Validate amount > 0
#   - Validate currency is supported
# ──────────────────────────────────────────────────────
class PaymentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            "id", "patient", "patient_name", "amount", "currency",
            "payment_type", "gateway_type", "status",
            "gateway_reference_id", "receipt_url", "description",
            "paid_at", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "status", "gateway_reference_id",
            "receipt_url", "paid_at", "created_at", "updated_at",
        ]

    def get_patient_name(self, obj):
        # TODO (Abdullah): Return patient's full name
        pass

    def validate_amount(self, value):
        # TODO (Abdullah): Validate amount > 0
        pass


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement PaymentInitiateSerializer
#   - Fields: amount, currency, payment_type, gateway_type, description
#   - Used for POST /payments/ (initiate a new payment)
#   - Return gateway-specific redirect URL or reference code
#   - For Fawry: return fawry_reference_number
#   - For Card: return payment_url for 3D Secure redirect
# ──────────────────────────────────────────────────────
class PaymentInitiateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["amount", "currency", "payment_type", "gateway_type", "description"]

    def create(self, validated_data):
        # TODO (Abdullah): Create payment record with PENDING status
        # TODO (Abdullah): Call gateway-specific initiation logic
        # TODO (Abdullah): Return payment with gateway reference
        pass


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement FawryWebhookSerializer
#   - Fields: merchantRefNum, fawryRefNumber, paymentStatus, paymentAmount
#   - Used to validate incoming Fawry webhook callbacks
#   - Verify webhook signature using FAWRY_SECURITY_KEY
#   - Update payment status accordingly
# ──────────────────────────────────────────────────────
class FawryWebhookSerializer(serializers.Serializer):
    merchantRefNum = serializers.CharField()
    fawryRefNumber = serializers.CharField()
    paymentStatus = serializers.CharField()
    paymentAmount = serializers.DecimalField(max_digits=10, decimal_places=2)
    messageSignature = serializers.CharField()

    def validate(self, attrs):
        # TODO (Abdullah): Verify Fawry webhook signature
        # TODO (Abdullah): Map Fawry status to Payment.Status choices
        pass


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement PaymentReceiptSerializer
#   - Fields: id, patient_name, amount, currency, payment_type,
#             gateway_type, status, paid_at, receipt_url
#   - Read-only serializer for generating/viewing receipts
#   - Include formatted amount with currency symbol
# ──────────────────────────────────────────────────────
class PaymentReceiptSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    formatted_amount = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            "id", "patient_name", "amount", "formatted_amount",
            "currency", "payment_type", "gateway_type",
            "status", "paid_at", "receipt_url",
        ]

    def get_patient_name(self, obj):
        # TODO (Abdullah): Return patient's full name
        pass

    def get_formatted_amount(self, obj):
        # TODO (Abdullah): Return formatted amount like "EGP 150.00"
        pass
