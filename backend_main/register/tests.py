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
            id_number="12345678X",
            rol=0,
        )

    def test_user_creation(self) -> None:
        self.assertEqual(self.user.email, "test@example.com")
        self.assertEqual(self.user.phone_number, "+1234567890")
        self.assertEqual(self.user.name, "Test User")
        self.assertEqual(self.user.id_number, "12345678X")
        self.assertEqual(self.user.rol, 0)


class RegisterUserTests(APITestCase):
    def setUp(self) -> None:
        self.url = reverse("register_user")
        self.valid_data = {
            "email": "newuser@example.com",
            "phone_number": "123456789",
            "name": "New User",
            "id_number": "87654321X",
            "rol": 0,  # Usuario normal
        }

    def test_register_user_successful(self) -> None:
        response = self.client.post(self.url, data=self.valid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_user_duplicate_email(self) -> None:
        User.objects.create(**self.valid_data)

        response = self.client.post(self.url, data=self.valid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_user_duplicate_phone_number(self) -> None:
        User.objects.create(**self.valid_data)

        data = self.valid_data.copy()
        data["email"] = "anotheruser@example.com"

        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_user_missing_fields(self) -> None:
        incomplete_data = self.valid_data.copy()
        del incomplete_data["email"]

        response = self.client.post(self.url, data=incomplete_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
