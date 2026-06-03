from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from appointments.models import Appointment
from consent.models import Consent
from hospitals.models import Hospital
from notifications.models import Notification
from payments.models import Payment
from records.models import MedicalRecord
from staff.models import Staff

from .models import Patient

User = get_user_model()


class PatientsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.patient_user = self.create_user(
            email="patient@example.com",
            role=User.Role.PATIENT,
            first_name="Mina",
            last_name="Nashat",
        )
        self.doctor_user = self.create_user(
            email="doctor@example.com",
            role=User.Role.DOCTOR,
            first_name="Sarah",
            last_name="Johnson",
        )

    def create_user(self, email, role, **overrides):
        data = {
            "username": email,
            "email": email,
            "role": role,
            "first_name": overrides.pop("first_name", "Test"),
            "last_name": overrides.pop("last_name", "User"),
        }
        data.update(overrides)
        return User.objects.create_user(password="StrongPass123!", **data)

    def authenticate(self, user):
        response = self.client.post(
            "/api/v1/auth/login",
            {"email": user.email, "password": "StrongPass123!"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        return response.data

    def test_profile_get_or_create_and_update(self):
        self.authenticate(self.patient_user)

        profile = self.client.get("/api/v1/patients/profile")
        self.assertEqual(profile.status_code, status.HTTP_200_OK)
        self.assertTrue(Patient.objects.filter(user=self.patient_user).exists())

        update = self.client.patch(
            "/api/v1/patients/profile",
            {
                "first_name": "Updated",
                "phone_number": "01012345678",
                "national_id": "29901012345678",
                "date_of_birth": "1999-01-01",
                "blood_type": "O+",
            },
            format="json",
        )
        self.assertEqual(update.status_code, status.HTTP_200_OK)
        self.assertEqual(update.data["first_name"], "Updated")
        self.assertEqual(update.data["national_id"], "29901012345678")

    def test_national_id_must_be_fourteen_digits(self):
        self.authenticate(self.patient_user)

        response = self.client.patch(
            "/api/v1/patients/profile",
            {"national_id": "12345"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_patient_list_is_staff_only(self):
        Patient.objects.create(user=self.patient_user, national_id="29901012345678")

        self.authenticate(self.patient_user)
        patient_response = self.client.get("/api/v1/patients")
        self.assertEqual(patient_response.status_code, status.HTTP_403_FORBIDDEN)

        self.authenticate(self.doctor_user)
        staff_response = self.client.get("/api/v1/patients")
        self.assertEqual(staff_response.status_code, status.HTTP_200_OK)
        self.assertEqual(staff_response.data["count"], 1)

    def test_patient_detail_is_limited_for_patient_role(self):
        own_patient = Patient.objects.create(
            user=self.patient_user, national_id="29901012345678"
        )
        other_user = self.create_user(email="other@example.com", role=User.Role.PATIENT)
        other_patient = Patient.objects.create(
            user=other_user, national_id="29901012345679"
        )

        self.authenticate(self.patient_user)
        own_response = self.client.get(f"/api/v1/patients/{own_patient.id}")
        other_response = self.client.get(f"/api/v1/patients/{other_patient.id}")

        self.assertEqual(own_response.status_code, status.HTTP_200_OK)
        self.assertEqual(other_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_dashboard_aggregates_patient_metrics(self):
        patient = Patient.objects.create(
            user=self.patient_user, national_id="29901012345678"
        )
        hospital = Hospital.objects.create(
            name="MediSecure Hospital",
            address="Cairo",
            email="hospital@example.com",
            phone="01000000000",
        )
        staff = Staff.objects.create(user=self.doctor_user, hospital=hospital)

        MedicalRecord.objects.create(
            patient=patient,
            created_by=self.doctor_user,
            record_type=MedicalRecord.RecordType.DIAGNOSIS,
            title="Annual Checkup",
        )
        Appointment.objects.create(
            patient=patient,
            staff=staff,
            scheduled_at=timezone.now() + timedelta(days=1),
            status=Appointment.Status.CONFIRMED,
        )
        Consent.objects.create(
            patient=patient,
            staff=staff,
            purpose=Consent.Purpose.TREATMENT,
            is_active=True,
        )
        Payment.objects.create(
            patient=patient,
            amount=Decimal("150.00"),
            payment_type=Payment.PaymentType.CONSULTATION,
            gateway_type=Payment.GatewayType.CASH,
            status=Payment.Status.PENDING,
        )
        Notification.objects.create(
            user=self.patient_user,
            notification_type=Notification.NotificationType.RECORD,
            subject="Record uploaded",
            content="Annual Checkup",
            is_read=False,
        )

        self.authenticate(self.patient_user)
        response = self.client.get("/api/v1/patients/dashboard")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_records"], 1)
        self.assertEqual(response.data["upcoming_appointments"], 1)
        self.assertEqual(response.data["active_consents"], 1)
        self.assertEqual(response.data["pending_payments"], 1)
        self.assertEqual(len(response.data["recent_notifications"]), 1)
