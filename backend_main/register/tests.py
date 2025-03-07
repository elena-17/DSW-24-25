from unittest.mock import patch
import requests

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from register.models import User


class UserTestCase(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create(
            email="test@example.com",
            phone_number="+1234567890",
            name="Test User",
            id_number="1234567890",
            credit_card_number="1234567890123456",
        )

    def test_user_creation(self) -> None:
        self.assertEqual(self.user.email, "test@example.com")
        self.assertEqual(self.user.phone_number, "+1234567890")
        self.assertEqual(self.user.name, "Test User")
        self.assertEqual(self.user.id_number, "1234567890")
        self.assertEqual(self.user.credit_card_number, "1234567890123456")


class RegisterUserTests(APITestCase):
    def setUp(self) -> None:
        self.url = reverse("register_user")

    @patch("requests.post")  
    def test_register_user_valid_card(self, mock_post) -> None:
        mock_post.return_value.status_code = 200

        data = {
            "email": "test@example.com",
            "phone_number": "123456789",
            "name": "Test User",
            "id_number": "12345678",
            "credit_card": "1234567890123456",
            "rol": 0,
        }
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    @patch("requests.post")
    def test_register_user_invalid_card(self, mock_post) -> None:
        mock_post.return_value.status_code = 400

        data = {
            "email": "test@example.com",
            "phone_number": "123456789",
            "name": "Test User",
            "id_number": "12345678",
            "credit_card": "1234567890123456",
            "rol": 0,
        }
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("requests.post")
    def test_register_user_error_validating_card(self, mock_post) -> None:
        mock_post.side_effect = requests.exceptions.RequestException

        data = {
            "email": "test@example.com",
            "phone_number": "123456789",
            "name": "Test User",
            "id_number": "12345678",
            "credit_card": "1234567890123456",
            "rol": 0,
        }
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)