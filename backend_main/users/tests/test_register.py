from account.models import Account
from django.contrib.auth.hashers import check_password
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User


class RegisterUserTests(APITestCase):
    def setUp(self) -> None:
        self.url = reverse("user:register_user")
        self.valid_data = {
            "email": "newuser@example.com",
            "phone": "123456789",
            "name": "New User",
            "id_number": "87654321X",
            "role": "user",
            "password": "securepassword123",
        }

    def test_register_user_successful(self) -> None:
        # POST request to register a new user
        response = self.client.post(self.url, data=self.valid_data, format="json")

        # Verify correct response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("message", response.data)
        self.assertTrue(User.objects.filter(email=self.valid_data["email"]).exists())

        # Verify that the user was created in the database
        user = User.objects.get(email=self.valid_data["email"])
        self.assertEqual(user.phone, self.valid_data["phone"])
        self.assertEqual(user.name, self.valid_data["name"])
        self.assertEqual(user.id_number, self.valid_data["id_number"])
        self.assertEqual(user.role, self.valid_data["role"])

        # First argument is the password, second argument is the hashed password
        self.assertTrue(check_password(self.valid_data["password"], user.password))

        # Check that the Account was created for the user
        account = Account.objects.get(user=user)
        self.assertIsNotNone(account)
        self.assertEqual(account.balance, 0.00)  # Verifica que el balance de la cuenta es 0.00

        # Verify that the token field exists and is null
        # self.assertIsNone(user.token)

    def test_register_user_duplicate_email(self) -> None:
        User.objects.create(**self.valid_data)

        response = self.client.post(self.url, data=self.valid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_user_duplicate_phone(self) -> None:
        User.objects.create(**self.valid_data)

        data = self.valid_data.copy()
        data["email"] = "anotheruser@example.com"
        data["id_number"] = "12345678A"

        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_user_missing_fields(self) -> None:
        incomplete_data = self.valid_data.copy()
        del incomplete_data["email"]

        response = self.client.post(self.url, data=incomplete_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
