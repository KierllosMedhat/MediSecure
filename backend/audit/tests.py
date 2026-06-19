from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from audit.models import AuditLog

User = get_user_model()


class AuditAPITests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            email="admin@test.com", password="pw", username="admin", role="ADMIN"
        )
        self.patient_user = User.objects.create_user(
            email="patient@test.com", password="pw", username="patient", role="PATIENT"
        )

        self.log1 = AuditLog.objects.create(
            user=self.admin_user,
            action="LOGIN",
            entity_type="USER",
            entity_id=str(self.admin_user.id),
            ip_address="127.0.0.1"
        )
        self.log2 = AuditLog.objects.create(
            user=self.patient_user,
            action="LOGOUT",
            entity_type="USER",
            entity_id=str(self.patient_user.id),
            ip_address="192.168.1.1"
        )

        self.list_url = reverse("audit:audit-list")
        self.stats_url = reverse("audit:audit-stats")
        self.export_url = reverse("audit:audit-export")

    def test_audit_list_admin_only(self):
        # Admin can view
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 2)

        # Patient cannot view
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_audit_list_filtering(self):
        self.client.force_authenticate(user=self.admin_user)
        # Filter by action
        response = self.client.get(self.list_url, {"action": "LOGIN"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["action"], "LOGIN")

        # Search by IP
        response = self.client.get(self.list_url, {"search": "192.168.1.1"})
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["action"], "LOGOUT")

    def test_audit_stats(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_actions_today", response.data)
        self.assertIn("actions_by_type", response.data)
        self.assertIn("top_users", response.data)

    def test_audit_export(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.export_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.headers.get("Content-Type"), "text/csv")
        content = b"".join(response.streaming_content).decode('utf-8')
        self.assertIn("id,timestamp,user_email,action,entity_type,entity_id,ip_address,user_agent,details", content)
        self.assertIn("LOGIN", content)
        self.assertIn("LOGOUT", content)
