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

from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError

from .models import Payment
from .serializers import (
    PaymentSerializer,
    PaymentInitiateSerializer,
    FawryWebhookSerializer,
    PaymentReceiptSerializer,
)

def get_patient_from_user(user):
    if hasattr(user, 'patient_profile'):
        return user.patient_profile
    return None

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
        user = self.request.user
        queryset = Payment.objects.select_related('patient__user').all()

        if user.role == 'PATIENT':
            patient = get_patient_from_user(user)
            if not patient:
                return Payment.objects.none()
            queryset = queryset.filter(patient=patient)
        elif user.role not in ['ADMIN', 'BILLING_STAFF']:
            raise PermissionDenied("You do not have permission to view payments.")

        status_filter = self.request.query_params.get('status')
        gateway = self.request.query_params.get('gateway_type')
        payment_type = self.request.query_params.get('payment_type')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if gateway:
            queryset = queryset.filter(gateway_type=gateway)
        if payment_type:
            queryset = queryset.filter(payment_type=payment_type)
        if start_date and end_date:
            queryset = queryset.filter(created_at__range=[start_date, end_date])

        return queryset


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
        if request.user.role != 'PATIENT':
            raise PermissionDenied("Only patients have an outstanding balance.")
        
        patient = get_patient_from_user(request.user)
        if not patient:
            raise NotFound("Patient profile not found.")

        pending_payments = Payment.objects.filter(patient=patient, status=Payment.Status.PENDING)
        total_balance = pending_payments.aggregate(total=Sum('amount'))['total'] or 0.00
        
        return Response({
            "balance": total_balance,
            "currency": Payment.Currency.EGP,
            "pending_count": pending_payments.count()
        }, status=status.HTTP_200_OK)


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
        patient = get_patient_from_user(request.user)
        if not patient:
            raise PermissionDenied("Only patients can initiate payments.")

        data = request.data.copy()
        data['gateway_type'] = Payment.GatewayType.FAWRY

        serializer = PaymentInitiateSerializer(data=data, context={'patient': patient})
        if serializer.is_valid():
            payment = serializer.save()
            
            expires_at = payment.created_at + timedelta(hours=24)
            
            return Response({
                "payment_id": payment.id,
                "fawry_reference_number": payment.fawry_reference_number,
                "amount": payment.amount,
                "currency": payment.currency,
                "expires_at": expires_at
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        patient = get_patient_from_user(request.user)
        if not patient:
            raise PermissionDenied("Only patients can initiate payments.")

        # نحقن البوابة في الداتا المبعوتة
        data = request.data.copy()
        data['gateway_type'] = Payment.GatewayType.CARD

        serializer = PaymentInitiateSerializer(data=data, context={'patient': patient})
        if serializer.is_valid():
            payment = serializer.save()
            
            return Response({
                "payment_id": payment.id,
                "payment_url": payment.payment_url,
                "amount": payment.amount,
                "currency": payment.currency,
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        try:
            payment = Payment.objects.get(pk=pk)
        except Payment.DoesNotExist:
            raise NotFound("Payment not found.")

        if request.user.role == 'PATIENT':
            patient = get_patient_from_user(request.user)
            if payment.patient != patient:
                raise PermissionDenied("You cannot view this payment status.")
        elif request.user.role not in ['ADMIN', 'BILLING_STAFF']:
            raise PermissionDenied("Unauthorized access.")

        return Response({
            "payment_id": payment.id,
            "status": payment.status,
            "paid_at": payment.paid_at,
            "gateway_reference_id": payment.gateway_reference_id
        }, status=status.HTTP_200_OK)


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
        user = self.request.user
        queryset = Payment.objects.filter(status=Payment.Status.PAID)

        if user.role == 'PATIENT':
            patient = get_patient_from_user(user)
            return queryset.filter(patient=patient)
        elif user.role in ['ADMIN', 'BILLING_STAFF']:
            return queryset
        return Payment.objects.none()


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
        serializer = FawryWebhookSerializer(data=request.data)
        if serializer.is_valid():
            fawry_ref = serializer.validated_data['fawryRefNumber']
            new_status = serializer.validated_data['internal_status']
            
            try:
                payment = Payment.objects.get(gateway_reference_id=fawry_ref, gateway_type=Payment.GatewayType.FAWRY)
                payment.status = new_status
                if new_status == Payment.Status.PAID:
                    payment.paid_at = timezone.now()
                payment.save()
                return Response({"message": "Webhook processed successfully"}, status=status.HTTP_200_OK)
            except Payment.DoesNotExist:
                return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        reference_id = request.data.get('transaction_id')
        transaction_status = request.data.get('status')
        
        if not reference_id or not transaction_status:
            return Response({"error": "Missing payload data"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(gateway_reference_id=reference_id, gateway_type=Payment.GatewayType.CARD)
            if transaction_status.lower() == "success":
                payment.status = Payment.Status.PAID
                payment.paid_at = timezone.now()
            else:
                payment.status = Payment.Status.FAILED
            payment.save()
            return Response({"message": "Card Webhook processed"}, status=status.HTTP_200_OK)
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)


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
        if request.user.role not in ['ADMIN', 'BILLING_STAFF']:
            raise PermissionDenied("Only authorized staff can initiate refunds.")

        try:
            payment = Payment.objects.get(pk=pk)
        except Payment.DoesNotExist:
            raise NotFound("Payment not found.")

        if payment.status != Payment.Status.PAID:
            raise ValidationError("Only paid payments can be refunded.")
        
        payment.status = Payment.Status.REFUNDED
        payment.save()

        return Response({
            "message": "Refund initiated successfully",
            "payment_id": payment.id,
            "status": payment.status
        }, status=status.HTTP_200_OK)