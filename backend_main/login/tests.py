from django.contrib.auth.hashers import make_password
from django.urls import reverse
from register.models import User
from rest_framework import status
from rest_framework.test import APITestCase


class LoginUserTests(APITestCase):
    def setUp(self):
        # Create a user for testing
        self.user_data = {
            "email": "user@example.com",
            "phone_number": "123456789",
            "name": "Test User",
            "id_number": "12345678X",
            "rol": 0,
            "password": make_password("securepassword123"),
        }
        self.user = User.objects.create(**self.user_data)

    def test_login_user_successful(self):
        url = reverse("login_user")
        data = {"email_or_id_number": self.user.email, "password": "securepassword123"}

        # Initial login
        response = self.client.post(url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        self.assertEqual(response.data["message"], "Login successful")

        # Verify that the token was set after the first login
        self.user.refresh_from_db()  # Refresh the user instance to get updated data
        self.assertIsNotNone(self.user.token)
        token_after_first_login = self.user.token

        # Attempt login again with the same credentials
        response = self.client.post(url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        self.assertEqual(response.data["message"], "Login successful")

        # Verify that the token changed after the second login
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.token, token_after_first_login)  # Token should be different

    def test_login_user_with_id_number(self):
        url = reverse("login_user")
        data = {"email_or_id_number": self.user.id_number, "password": "securepassword123"}

        # Initial login
        response = self.client.post(url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        self.assertEqual(response.data["message"], "Login successful")

        # Verify that the token was set after the first login
        self.user.refresh_from_db()  # Refresh the user instance to get updated data
        self.assertIsNotNone(self.user.token)
        token_after_first_login = self.user.token

        # Attempt login again with the same credentials
        response = self.client.post(url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        self.assertEqual(response.data["message"], "Login successful")

        # Verify that the token changed after the second login
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.token, token_after_first_login)  # Token should be different

    def test_login_user_invalid_password(self):
        url = reverse("login_user")
        data = {"email_or_id_number": self.user.email, "password": "wrongpassword"}

        response = self.client.post(url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data)

    def test_login_user_non_existent(self):
        url = reverse("login_user")
        data = {"email_or_id_number": "nonexistent@example.com", "password": "securepassword123"}

        response = self.client.post(url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data)
