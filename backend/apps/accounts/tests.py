from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class ChangePasswordTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@resta.com", password="oldpass123"
        )
        self.client.force_authenticate(user=self.user)
        self.url = "/api/auth/change-password/"

    def test_change_password_success(self):
        response = self.client.post(
            self.url,
            {"current_password": "oldpass123", "new_password": "newpass456"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpass456"))
        self.assertFalse(self.user.check_password("oldpass123"))

    def test_wrong_current_password(self):
        response = self.client.post(
            self.url,
            {"current_password": "wrongpass", "new_password": "newpass456"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("current_password", response.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("oldpass123"))

    def test_short_new_password(self):
        response = self.client.post(
            self.url,
            {"current_password": "oldpass123", "new_password": "short"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password", response.data)

    def test_same_password(self):
        response = self.client.post(
            self.url,
            {"current_password": "oldpass123", "new_password": "oldpass123"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password", response.data)

    def test_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(
            self.url,
            {"current_password": "oldpass123", "new_password": "newpass456"},
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
