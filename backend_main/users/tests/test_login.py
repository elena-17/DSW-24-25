from django.contrib.auth.hashers import make_password
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User


class LoginUserTests(APITestCase):
    def setUp(self):
        # Create a user for testing
        self.user_data = {
            "email": "user@example.com",
            "phone": "123456789",
            "name": "Test User",
            "id_number": "12345678X",
            "role": "user",
            "password": make_password("securepassword123"),
        }
        self.user = User.objects.create(**self.user_data)
        self.url = reverse("user:login_user")

    def test_login_user_email_successful(self):
        data = {"email": self.user.email, "password": "securepassword123"}

        # Initial login
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_login_user_invalid_password(self):
        data = {"email": self.user.email, "password": "wrongpassword"}

        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", response.data)

    def test_login_user_non_existent(self):
        data = {"email": "nonexistent@example.com", "password": "securepassword123"}

        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", response.data)
