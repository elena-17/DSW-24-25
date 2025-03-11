from django.contrib.auth.hashers import check_password
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
            password="securepassword123",
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
            "rol": 0,
            "password": "securepassword123",
        }

    def test_register_user_successful(self) -> None:
        # POST request to register a new user
        response = self.client.post(self.url, data=self.valid_data, format="json")

        # Verify correct response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("message", response.data)

        # Verify that the user was created in the database
        user = User.objects.get(email=self.valid_data["email"])
        self.assertEqual(user.phone_number, self.valid_data["phone_number"])
        self.assertEqual(user.name, self.valid_data["name"])
        self.assertEqual(user.id_number, self.valid_data["id_number"])
        self.assertEqual(user.rol, self.valid_data["rol"])

        # First argument is the password, second argument is the hashed password
        self.assertTrue(check_password(self.valid_data["password"], user.password))

        # Verify that the token field exists and is null
        self.assertIsNone(user.token)

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
