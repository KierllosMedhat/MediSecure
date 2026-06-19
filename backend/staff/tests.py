from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from staff.models import Staff
from hospitals.models import Hospital

User = get_user_model()


class StaffAPITests(APITestCase):
    def setUp(self):
        # Create Admin User
        self.admin_user = User.objects.create_user(
            email="admin@test.com",
            password="testpassword",
            username="admin_test",
            role="ADMIN"
        )
        
        # Create Patient User for unauthorized tests
        self.patient_user = User.objects.create_user(
            email="patient@test.com",
            password="testpassword",
            username="patient_test",
            role="PATIENT"
        )

        self.hospital = Hospital.objects.create(
            name="General Hospital",
            email="contact@hospital.com",
            phone="123456789"
        )

        self.list_create_url = reverse("staff:staff-list-create")

    def test_create_staff_admin_only(self):
        # Admin creates staff
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "email": "doctor2@test.com",
            "password": "strongpassword123",
            "first_name": "Alice",
            "last_name": "Wonder",
            "role": "DOCTOR",
            "hospital": self.hospital.id,
            "department": "CARDIOLOGY",
            "license_no": "DOC999"
        }
        response = self.client.post(self.list_create_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Staff.objects.count(), 1)
        self.assertEqual(User.objects.filter(email="doctor2@test.com").count(), 1)
        
        # Patient tries to create staff (fails)
        self.client.force_authenticate(user=self.patient_user)
        response2 = self.client.post(self.list_create_url, data, format="json")
        self.assertEqual(response2.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_doctor_requires_license(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "email": "doctor_no_lic@test.com",
            "password": "strongpassword123",
            "first_name": "Bob",
            "last_name": "NoLic",
            "role": "DOCTOR",
            "hospital": self.hospital.id,
            "department": "CARDIOLOGY"
            # Missing license_no
        }
        response = self.client.post(self.list_create_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("license_no", response.data)

    def test_staff_list(self):
        # Create a staff member
        user = User.objects.create_user(email="doc1@test.com", password="pw", username="doc1", role="DOCTOR")
        Staff.objects.create(user=user, hospital=self.hospital, department="GENERAL", license_no="DOC1")
        
        # Admin views staff
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)
        
        # Patient cannot view staff
        self.client.force_authenticate(user=self.patient_user)
        response2 = self.client.get(self.list_create_url)
        self.assertEqual(response2.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_deactivate(self):
        # Create a staff member
        doc_user = User.objects.create_user(email="doc1@test.com", password="pw", username="doc1", role="DOCTOR")
        staff = Staff.objects.create(user=doc_user, hospital=self.hospital, department="GENERAL", license_no="DOC1")
        
        deactivate_url = reverse("staff:staff-deactivate", kwargs={"pk": staff.pk})
        
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(deactivate_url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        staff.refresh_from_db()
        doc_user.refresh_from_db()
        
        self.assertFalse(staff.is_active)
        self.assertFalse(doc_user.is_active)

    def test_staff_dashboard(self):
        doc_user = User.objects.create_user(email="doc1@test.com", password="pw", username="doc1", role="DOCTOR")
        staff = Staff.objects.create(user=doc_user, hospital=self.hospital, department="GENERAL", license_no="DOC1")
        
        dashboard_url = reverse("staff:staff-dashboard")
        
        self.client.force_authenticate(user=doc_user)
        response = self.client.get(dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_patients", response.data)
        self.assertIn("today_appointments", response.data)
