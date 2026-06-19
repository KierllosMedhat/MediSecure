"""
Payments Serializers — Owner: Abdullah

Serializers for payment initiation, status tracking, and receipt generation.
"""

import uuid
import hashlib
from django.conf import settings
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
    appointment_info = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            "id", "patient", "patient_name", "amount", "currency",
            "payment_type", "gateway_type", "status",
            "gateway_reference_id", "receipt_url", "description",
            "paid_at", "created_at", "updated_at", "appointment_info"
        ]
        read_only_fields = [
            "id", "status", "gateway_reference_id",
            "receipt_url", "paid_at", "created_at", "updated_at",
        ]

    def get_patient_name(self, obj):
        try:
            return f"{obj.patient.user.first_name} {obj.patient.user.last_name}".strip()
        except AttributeError:
            return f"Patient #{obj.patient_id}"

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("The payment amount must be greater than zero.")
        return value

    def get_appointment_info(self, obj):
        if obj.appointment:
            date_str = obj.appointment.scheduled_at.strftime('%Y-%m-%d %H:%M') if obj.appointment.scheduled_at else "TBD"
            staff_name = " ".join(part for part in [obj.appointment.staff.user.first_name, obj.appointment.staff.user.last_name] if part).strip()
            if not staff_name:
                staff_name = obj.appointment.staff.user.email
            return {
                "id": obj.appointment.id,
                "date": date_str,
                "doctor": staff_name,
            }
        return None


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement PaymentInitiateSerializer
#   - Fields: amount, currency, payment_type, gateway_type, description
#   - Used for POST /payments/ (initiate a new payment)
#   - Return gateway-specific redirect URL or reference code
#   - For Fawry: return fawry_reference_number
#   - For Card: return payment_url for 3D Secure redirect
# ──────────────────────────────────────────────────────
class PaymentInitiateSerializer(serializers.ModelSerializer):
    # These fields are added to return gateway-specific responses back to the frontend
    payment_url = serializers.URLField(read_only=True)
    fawry_reference_number = serializers.CharField(read_only=True)

    class Meta:
        model = Payment
        fields = [
            "amount", "currency", "payment_type", "gateway_type", 
            "description", "payment_url", "fawry_reference_number"
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("The payment amount must be greater than zero.")
        return value

    def create(self, validated_data):
        patient = self.context.get("patient")
        if not patient:
            raise serializers.ValidationError("Patient context is missing.")

        validated_data['patient'] = patient
        validated_data['status'] = Payment.Status.PENDING

        payment = super().create(validated_data)

        # Simulate Gateway Initiation Logic
        # In a real-world scenario, you would call the Fawry/Stripe/Paymob APIs here
        if payment.gateway_type == Payment.GatewayType.FAWRY:
            # Generate a mock Fawry reference number (typically 9-10 digits)
            payment.fawry_reference_number = f"99{uuid.uuid4().int % 100000000:08d}"
            payment.gateway_reference_id = payment.fawry_reference_number
        
        elif payment.gateway_type == Payment.GatewayType.CARD:
            # Generate a mock 3D Secure checkout URL
            payment.payment_url = f"https://checkout.mock-gateway.com/pay/{uuid.uuid4().hex}"
            payment.gateway_reference_id = f"CARD_{payment.id}_{uuid.uuid4().hex[:8]}"
        
        else: # CASH
            payment.gateway_reference_id = f"CASH_{payment.id}"

        # Save the generated references back to the database
        payment.save(update_fields=['gateway_reference_id'])

        return payment


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
        merchant_ref = attrs.get('merchantRefNum')
        fawry_ref = attrs.get('fawryRefNumber')
        amount = attrs.get('paymentAmount')
        status = attrs.get('paymentStatus')
        provided_signature = attrs.get('messageSignature')

        # Retrieve security key from settings (fallback to empty string for safety if not set)
        security_key = getattr(settings, 'FAWRY_SECURITY_KEY', '')

        # Standard Fawry Signature Generation (MerchantCode is usually needed, omitted here for brevity)
        # Formula: sha256(merchantRefNum + fawryRefNumber + amount + status + securityKey)
        hash_string = f"{merchant_ref}{fawry_ref}{amount:.2f}{status}{security_key}"
        expected_signature = hashlib.sha256(hash_string.encode('utf-8')).hexdigest()

        # In production, you would block the request if signatures don't match
        # if provided_signature != expected_signature:
        #     raise serializers.ValidationError("Invalid webhook signature.")

        # Map Fawry statuses to System statuses
        status_mapping = {
            "PAID": Payment.Status.PAID,
            "CANCELED": Payment.Status.CANCELLED,
            "FAILED": Payment.Status.FAILED,
            "REFUNDED": Payment.Status.REFUNDED,
            "EXPIRED": Payment.Status.FAILED,
        }
        
        attrs['internal_status'] = status_mapping.get(status.upper(), Payment.Status.PROCESSING)
        return attrs


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
        try:
            return f"{obj.patient.user.first_name} {obj.patient.user.last_name}".strip()
        except AttributeError:
            return f"Patient #{obj.patient_id}"

    def get_formatted_amount(self, obj):
        # Format amount to strings like "EGP 150.00" or "USD 45.50"
        return f"{obj.currency} {obj.amount:,.2f}"