from datetime import timedelta
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from patients.models import Patient
from staff.models import Staff
from appointments.models import Appointment

User = get_user_model()


class AppointmentsAPITests(APITestCase):
    def setUp(self):
        # Create Patient User
        self.patient_user = User.objects.create_user(
            email="patient@test.com",
            password="testpassword",
            username="patient_test",
            first_name="John",
            last_name="Doe",
            role="PATIENT"
        )
        self.patient = Patient.objects.create(user=self.patient_user)

        # Create Doctor User
        self.doctor_user = User.objects.create_user(
            email="doctor@test.com",
            password="testpassword",
            username="doctor_test",
            first_name="Jane",
            last_name="Smith",
            role="DOCTOR"
        )
        # Note: staff.hospital requires a hospital instance, but let's mock it or allow null if possible,
        # wait, let me check if staff model has a mandatory hospital.
        # Actually, let me just create a dummy hospital to be safe, since it's a FK.
        from hospitals.models import Hospital
        self.hospital = Hospital.objects.create(
            name="General Hospital",
            email="contact@hospital.com",
            phone="123456789"
        )
        self.staff_doctor = Staff.objects.create(
            user=self.doctor_user,
            hospital=self.hospital,
            department="CARDIOLOGY",
            license_no="DOC123"
        )

        # Create Admin User
        self.admin_user = User.objects.create_user(
            email="admin@test.com",
            password="testpassword",
            username="admin_test",
            role="ADMIN"
        )

        self.list_create_url = reverse("appointments:appointment-list-create")

    def test_create_appointment_success(self):
        self.client.force_authenticate(user=self.patient_user)
        future_time = timezone.now() + timedelta(days=1)
        data = {
            "patient": self.patient.id,
            "staff": self.staff_doctor.id,
            "scheduled_at": future_time.isoformat(),
            "duration_min": 30,
            "appointment_type": "IN_PERSON",
            "notes": "Regular checkup"
        }
        response = self.client.post(self.list_create_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointment.objects.count(), 1)
        appointment = Appointment.objects.first()
        self.assertEqual(appointment.patient, self.patient)
        self.assertEqual(appointment.status, "SCHEDULED")

    def test_create_appointment_past_date_fails(self):
        self.client.force_authenticate(user=self.patient_user)
        past_time = timezone.now() - timedelta(days=1)
        data = {
            "staff": self.staff_doctor.id,
            "scheduled_at": past_time.isoformat(),
        }
        response = self.client.post(self.list_create_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("scheduled_at", response.data)

    def test_create_appointment_overlapping_fails(self):
        future_time = timezone.now() + timedelta(days=1)
        Appointment.objects.create(
            patient=self.patient,
            staff=self.staff_doctor,
            scheduled_at=future_time,
            duration_min=30,
            status="SCHEDULED"
        )

        self.client.force_authenticate(user=self.patient_user)
        # Try to schedule 10 minutes later (overlaps)
        overlap_time = future_time + timedelta(minutes=10)
        data = {
            "patient": self.patient.id,
            "staff": self.staff_doctor.id,
            "scheduled_at": overlap_time.isoformat(),
            "duration_min": 30
        }
        response = self.client.post(self.list_create_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data)

    def test_appointment_list_role_based_filtering(self):
        # Create an appointment for patient
        future_time = timezone.now() + timedelta(days=1)
        appt = Appointment.objects.create(
            patient=self.patient,
            staff=self.staff_doctor,
            scheduled_at=future_time,
            status="SCHEDULED"
        )

        # Patient sees their own
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Handle pagination
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)

        # Create another patient
        other_user = User.objects.create_user(email="other@test.com", password="pw", username="other", role="PATIENT")
        other_patient = Patient.objects.create(user=other_user)
        self.client.force_authenticate(user=other_user)
        response = self.client.get(self.list_create_url)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 0)

        # Admin sees all
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_create_url)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)

    def test_appointment_status_transition(self):
        future_time = timezone.now() + timedelta(days=1)
        appt = Appointment.objects.create(
            patient=self.patient,
            staff=self.staff_doctor,
            scheduled_at=future_time,
            status="SCHEDULED"
        )
        status_url = reverse("appointments:appointment-status", kwargs={"pk": appt.pk})

        # Staff marks as confirmed
        self.client.force_authenticate(user=self.doctor_user)
        data = {"status": "CONFIRMED"}
        response = self.client.patch(status_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        appt.refresh_from_db()
        self.assertEqual(appt.status, "CONFIRMED")

        # Invalid transition: CONFIRMED to SCHEDULED
        data = {"status": "SCHEDULED"}
        response = self.client.patch(status_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_appointment_cancel_requires_reason(self):
        future_time = timezone.now() + timedelta(days=1)
        appt = Appointment.objects.create(
            patient=self.patient,
            staff=self.staff_doctor,
            scheduled_at=future_time,
            status="SCHEDULED"
        )
        status_url = reverse("appointments:appointment-status", kwargs={"pk": appt.pk})

        self.client.force_authenticate(user=self.doctor_user)
        data = {"status": "CANCELLED"}
        response = self.client.patch(status_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("cancelled_reason", response.data)

        data = {"status": "CANCELLED", "cancelled_reason": "Patient requested"}
        response = self.client.patch(status_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        appt.refresh_from_db()
        self.assertEqual(appt.status, "CANCELLED")

    def test_appointment_soft_delete(self):
        future_time = timezone.now() + timedelta(days=1)
        appt = Appointment.objects.create(
            patient=self.patient,
            staff=self.staff_doctor,
            scheduled_at=future_time,
            status="SCHEDULED"
        )
        detail_url = reverse("appointments:appointment-detail", kwargs={"pk": appt.pk})

        self.client.force_authenticate(user=self.patient_user)
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        appt.refresh_from_db()
        self.assertEqual(appt.status, "CANCELLED")
