"""
Payments Views — Owner: Abdullah

API views aligned to frontend paymentService.js:
  GET    /payments              → PaymentListView      (getPaymentHistory)
  GET    /payments/balance      → PaymentBalanceView   (getOutstandingBalance)
  POST   /payments/fawry        → FawryPaymentView     (payWithFawry)
  POST   /payments/card         → CardPaymentView      (payWithCard)
  GET    /payments/<id>/status  → PaymentStatusView    (getPaymentStatus)
  GET    /payments/<id>/receipt → PaymentReceiptView   (getReceipt)

Internal:
  POST   /payments/webhooks/fawry → FawryWebhookView
  POST   /payments/webhooks/card  → CardWebhookView
  POST   /payments/<id>/refund    → PaymentRefundView
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Payment
from .serializers import (
    PaymentSerializer,
    PaymentInitiateSerializer,
    FawryWebhookSerializer,
    PaymentReceiptSerializer,
)


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement PaymentListView
#   - GET /api/v1/payments → list payments for current user
#   - Patients see only their own payments
#   - Billing staff / admin see all payments
#   - Filter by: status, gateway_type, payment_type, date range
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────
class PaymentListView(generics.ListAPIView):
    """List payment history."""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO (Abdullah): Filter by user role, status, gateway, type, dates
        pass


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement PaymentBalanceView
#   - GET /api/v1/payments/balance
#   - Frontend: getOutstandingBalance()
#   - Returns: { balance: number, currency: "EGP", pending_count: number }
#   - Sum of all PENDING payments for the current patient
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────
class PaymentBalanceView(APIView):
    """Return outstanding balance for the authenticated patient."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO (Abdullah): Aggregate PENDING payments for request.user's patient
        # TODO (Abdullah): Return {"balance": total, "currency": "EGP", "pending_count": n}
        pass


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement FawryPaymentView
#   - POST /api/v1/payments/fawry
#   - Frontend payload: { fawry_code, amount, currency, payment_type }
#   - Create Payment record with gateway_type=FAWRY, status=PENDING
#   - Call Fawry API to generate a reference number
#   - Return: { payment_id, fawry_reference_number, amount, expires_at }
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────
class FawryPaymentView(APIView):
    """Initiate a Fawry payment."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # TODO (Abdullah): Create payment with PENDING status
        # TODO (Abdullah): Call Fawry API with FAWRY_MERCHANT_CODE + FAWRY_SECURITY_KEY
        # TODO (Abdullah): Return fawry_reference_number and expiry
        pass


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement CardPaymentView
#   - POST /api/v1/payments/card
#   - Frontend payload: { card_token, cvv, amount, currency, payment_type }
#   - Create Payment record with gateway_type=CARD, status=PENDING
#   - Call card gateway (Visa/MC) to create a payment session
#   - Return: { payment_id, payment_url } for 3D-Secure redirect
#   - Permission: IsAuthenticated
# ──────────────────────────────────────────────────────
class CardPaymentView(APIView):
    """Initiate a card (Visa/Mastercard) payment."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # TODO (Abdullah): Create payment with PENDING status
        # TODO (Abdullah): Call card gateway, return redirect payment_url
        pass


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement PaymentStatusView
#   - GET /api/v1/payments/<id>/status
#   - Frontend: getPaymentStatus(paymentId)
#   - Return: { payment_id, status, paid_at, gateway_reference_id }
#   - Permission: IsAuthenticated + owner or billing staff
# ──────────────────────────────────────────────────────
class PaymentStatusView(APIView):
    """Get current status of a payment."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        # TODO (Abdullah): Get payment, check permissions, return status
        pass


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement PaymentReceiptView
#   - GET /api/v1/payments/<id>/receipt
#   - Frontend: getReceipt(paymentId)
#   - Only available for PAID payments
#   - Return receipt data for display or PDF generation
#   - Permission: IsAuthenticated + owner or billing staff
# ──────────────────────────────────────────────────────
class PaymentReceiptView(generics.RetrieveAPIView):
    """Retrieve payment receipt."""
    serializer_class = PaymentReceiptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO (Abdullah): Return PAID payments visible to request.user
        pass


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement FawryWebhookView
#   - POST /api/v1/payments/webhooks/fawry → handle Fawry callback
#   - Verify webhook signature (HMAC with FAWRY_SECURITY_KEY)
#   - Update payment status based on Fawry response
#   - Permission: AllowAny (webhook from Fawry, verify via signature)
# ──────────────────────────────────────────────────────
class FawryWebhookView(APIView):
    """Handle Fawry payment gateway webhook callback."""
    permission_classes = [AllowAny]

    def post(self, request):
        # TODO (Abdullah): Verify signature, update payment status
        pass


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement CardWebhookView
#   - POST /api/v1/payments/webhooks/card → handle card gateway callback
#   - Verify webhook authenticity
#   - Update payment status
#   - Permission: AllowAny (webhook)
# ──────────────────────────────────────────────────────
class CardWebhookView(APIView):
    """Handle card (Visa/Mastercard) payment gateway webhook."""
    permission_classes = [AllowAny]

    def post(self, request):
        # TODO (Abdullah): Verify webhook, update payment status
        pass


# ──────────────────────────────────────────────────────
# TODO (Abdullah): Implement PaymentRefundView
#   - POST /api/v1/payments/<id>/refund → initiate a refund
#   - Permission: IsAuthenticated + IsAdmin or IsBillingStaff
# ──────────────────────────────────────────────────────
class PaymentRefundView(APIView):
    """Initiate a payment refund."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # TODO (Abdullah): Get payment, call gateway refund, update status
        pass
