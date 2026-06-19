from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from notifications.models import Notification

User = get_user_model()


class NotificationsAPITests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email="user1@test.com", password="pw", username="user1"
        )
        self.user2 = User.objects.create_user(
            email="user2@test.com", password="pw", username="user2"
        )

        self.notif1 = Notification.objects.create(
            user=self.user1,
            notification_type="SYSTEM",
            subject="Welcome",
            content="Hello user1",
            is_read=False
        )
        self.notif2 = Notification.objects.create(
            user=self.user1,
            notification_type="ALERT",
            subject="Alert 1",
            content="Alert user1",
            is_read=True
        )
        self.notif3 = Notification.objects.create(
            user=self.user2,
            notification_type="SYSTEM",
            subject="Welcome",
            content="Hello user2",
            is_read=False
        )

        self.list_url = reverse("notifications:notification-list")
        self.read_all_url = reverse("notifications:mark-all-read")
        self.unread_count_url = reverse("notifications:unread-count")

    def test_notification_list_user_scoped(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 2)

        self.client.force_authenticate(user=self.user2)
        response = self.client.get(self.list_url)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)

    def test_unread_count(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.unread_count_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("unread_count"), 1)

    def test_mark_as_read(self):
        self.client.force_authenticate(user=self.user1)
        read_url = reverse("notifications:notification-read", kwargs={"pk": self.notif1.pk})
        response = self.client.patch(read_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.notif1.refresh_from_db()
        self.assertTrue(self.notif1.is_read)
        self.assertIsNotNone(self.notif1.read_at)

    def test_mark_all_as_read(self):
        # Create another unread for user1
        Notification.objects.create(
            user=self.user1,
            notification_type="SYSTEM",
            subject="Unread 2",
            content="Unread 2",
            is_read=False
        )
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.patch(self.read_all_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("updated_count"), 2)

        # Check DB
        unread_count = Notification.objects.filter(user=self.user1, is_read=False).count()
        self.assertEqual(unread_count, 0)

    def test_delete_notification(self):
        self.client.force_authenticate(user=self.user1)
        delete_url = reverse("notifications:notification-delete", kwargs={"pk": self.notif1.pk})
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Notification.objects.filter(pk=self.notif1.pk).count(), 0)

        # Try to delete user2's notification
        delete_url2 = reverse("notifications:notification-delete", kwargs={"pk": self.notif3.pk})
        response = self.client.delete(delete_url2)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
