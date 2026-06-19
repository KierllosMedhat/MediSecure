import uuid
import hashlib
from django.conf import settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from patients.models import Patient
from payments.models import Payment

User = get_user_model()


class PaymentsAPITests(APITestCase):
    def setUp(self):
        self.patient_user = User.objects.create_user(
            email="patient@test.com", password="pw", username="patient", role="PATIENT"
        )
        self.patient = Patient.objects.create(user=self.patient_user)

        self.admin_user = User.objects.create_user(
            email="admin@test.com", password="pw", username="admin", role="ADMIN"
        )

        self.payment1 = Payment.objects.create(
            patient=self.patient,
            amount=150.00,
            currency="EGP",
            payment_type="CONSULTATION",
            gateway_type="FAWRY",
            status="PENDING",
            gateway_reference_id="9912345678"
        )
        self.payment2 = Payment.objects.create(
            patient=self.patient,
            amount=200.00,
            currency="USD",
            payment_type="PROCEDURE",
            gateway_type="CARD",
            status="PAID"
        )
        self.payment3 = Payment.objects.create(
            patient=self.patient,
            amount=100.00,
            currency="USD",
            payment_type="CONSULTATION",
            gateway_type="CARD",
            status="PENDING",
            gateway_reference_id="CARD_12345"
        )

        self.list_url = reverse("payments:payment-list")
        self.balance_url = reverse("payments:payment-balance")
        self.fawry_url = reverse("payments:payment-fawry")
        self.card_url = reverse("payments:payment-card")
        self.fawry_webhook_url = reverse("payments:fawry-webhook")
        self.card_webhook_url = reverse("payments:card-webhook")

    def test_payment_list(self):
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 3)

    def test_payment_balance(self):
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.get(self.balance_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["balance"], 250.00)
        self.assertEqual(response.data["pending_count"], 2)

    def test_initiate_fawry_payment(self):
        self.client.force_authenticate(user=self.patient_user)
        data = {
            "amount": 100.00,
            "currency": "EGP",
            "payment_type": "LAB_TEST",
            "description": "Blood test"
        }
        response = self.client.post(self.fawry_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("fawry_reference_number", response.data)
        
        payment = Payment.objects.get(id=response.data["payment_id"])
        self.assertEqual(payment.gateway_type, "FAWRY")
        self.assertEqual(payment.status, "PENDING")

    def test_initiate_card_payment(self):
        self.client.force_authenticate(user=self.patient_user)
        data = {
            "amount": 300.00,
            "currency": "EGP",
            "payment_type": "MEDICATION"
        }
        response = self.client.post(self.card_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("payment_url", response.data)
        
        payment = Payment.objects.get(id=response.data["payment_id"])
        self.assertEqual(payment.gateway_type, "CARD")
        self.assertEqual(payment.status, "PENDING")

    def test_fawry_webhook_paid(self):
        # We need to simulate Fawry sending a PAID webhook
        # Signature logic in serializer uses: sha256(merchantRefNum + fawryRefNumber + amount + status + securityKey)
        security_key = getattr(settings, 'FAWRY_SECURITY_KEY', '')
        
        merchant_ref = str(self.payment1.id)
        fawry_ref = self.payment1.gateway_reference_id
        amount = 150.00
        status_str = "PAID"
        
        hash_string = f"{merchant_ref}{fawry_ref}{amount:.2f}{status_str}{security_key}"
        signature = hashlib.sha256(hash_string.encode('utf-8')).hexdigest()

        data = {
            "merchantRefNum": merchant_ref,
            "fawryRefNumber": fawry_ref,
            "paymentStatus": status_str,
            "paymentAmount": amount,
            "messageSignature": signature
        }
        
        response = self.client.post(self.fawry_webhook_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.payment1.refresh_from_db()
        self.assertEqual(self.payment1.status, "PAID")

    def test_card_webhook_success(self):
        data = {
            "transaction_id": self.payment3.gateway_reference_id,
            "status": "success"
        }
        
        response = self.client.post(self.card_webhook_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.payment3.refresh_from_db()
        self.assertEqual(self.payment3.status, "PAID")

    def test_payment_receipt(self):
        self.client.force_authenticate(user=self.patient_user)
        receipt_url = reverse("payments:payment-receipt", kwargs={"pk": self.payment2.pk})
        
        response = self.client.get(receipt_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "PAID")
        self.assertIn("formatted_amount", response.data)

        # Attempt to get receipt for PENDING payment
        receipt_url_pending = reverse("payments:payment-receipt", kwargs={"pk": self.payment1.pk})
        response_pending = self.client.get(receipt_url_pending)
        self.assertEqual(response_pending.status_code, status.HTTP_404_NOT_FOUND)

    def test_payment_refund_admin_only(self):
        refund_url = reverse("payments:payment-refund", kwargs={"pk": self.payment2.pk})
        
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.post(refund_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(refund_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.payment2.refresh_from_db()
        self.assertEqual(self.payment2.status, "REFUNDED")
