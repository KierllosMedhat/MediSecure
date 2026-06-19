from datetime import timedelta
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from patients.models import Patient
from staff.models import Staff
from hospitals.models import Hospital
from consent.models import Consent

User = get_user_model()


class ConsentAPITests(APITestCase):
    def setUp(self):
        self.patient_user = User.objects.create_user(
            email="patient@test.com", password="pw", username="patient", role="PATIENT"
        )
        self.patient = Patient.objects.create(user=self.patient_user)

        self.doctor_user = User.objects.create_user(
            email="doctor@test.com", password="pw", username="doctor", role="DOCTOR"
        )
        hospital = Hospital.objects.create(name="H1", email="h1@test.com", phone="123")
        self.staff_doctor = Staff.objects.create(
            user=self.doctor_user, hospital=hospital, department="GENERAL", license_no="DOC1"
        )

        self.admin_user = User.objects.create_user(
            email="admin@test.com", password="pw", username="admin", role="ADMIN"
        )

        self.consent1 = Consent.objects.create(
            patient=self.patient,
            staff=self.staff_doctor,
            purpose="TREATMENT",
            is_active=True
        )

        self.list_grant_url = reverse("patient-consent-list-grant", kwargs={"patient_id": "me"})
        self.revoke_url = reverse("patient-consent-revoke", kwargs={"patient_id": "me", "pk": self.consent1.pk})
        self.check_url = reverse("consent:consent-check")

    def test_consent_list(self):
        # Patient can view their own consents
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.get(self.list_grant_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Note: ConsentListGrantView might not use pagination, so we check type
        if isinstance(response.data, list):
            self.assertEqual(len(response.data), 1)
        else:
            self.assertEqual(len(response.data["results"]), 1)

    def test_grant_consent(self):
        # We need a new staff member to test granting (duplicate constraint prevents granting same again)
        doc2_user = User.objects.create_user(email="doc2@test.com", password="pw", username="doc2", role="DOCTOR")
        staff2 = Staff.objects.create(user=doc2_user, hospital=self.staff_doctor.hospital, department="GENERAL", license_no="DOC2")

        self.client.force_authenticate(user=self.patient_user)
        data = {
            "staff": staff2.id,
            "purpose": "RESEARCH",
            "expires_at": (timezone.now() + timedelta(days=30)).isoformat()
        }
        response = self.client.post(self.list_grant_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Consent.objects.filter(staff=staff2).exists())

    def test_cannot_grant_consent_to_self(self):
        # Make the patient also a staff member
        staff_self = Staff.objects.create(
            user=self.patient_user, hospital=self.staff_doctor.hospital, department="GENERAL", license_no="PATDOC"
        )
        self.client.force_authenticate(user=self.patient_user)
        data = {
            "staff": staff_self.id,
            "purpose": "TREATMENT"
        }
        response = self.client.post(self.list_grant_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Patients cannot grant consent", str(response.data))

    def test_duplicate_active_consent_fails(self):
        self.client.force_authenticate(user=self.patient_user)
        data = {
            "staff": self.staff_doctor.id,
            "purpose": "TREATMENT" # Already exists and active
        }
        response = self.client.post(self.list_grant_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_revoke_consent(self):
        self.client.force_authenticate(user=self.patient_user)
        data = {"revocation_reason": "No longer needed"}
        response = self.client.delete(self.revoke_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.consent1.refresh_from_db()
        self.assertFalse(self.consent1.is_active)
        self.assertIsNotNone(self.consent1.revoked_at)

    def test_consent_check(self):
        self.client.force_authenticate(user=self.admin_user)
        # Verify valid consent
        response = self.client.get(self.check_url, {
            "patient_id": self.patient.id,
            "staff_id": self.staff_doctor.id,
            "purpose": "TREATMENT"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["has_consent"])
        
        # Verify non-existent consent
        response = self.client.get(self.check_url, {
            "patient_id": self.patient.id,
            "staff_id": self.staff_doctor.id,
            "purpose": "RESEARCH"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["has_consent"])
