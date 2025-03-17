from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User


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


class UserAPI(APITestCase):

    def setUp(self) -> None:
        self.url_get = reverse("user:get_user_profile")
        self.url_update = reverse("user:update_user_profile")
        self.url_delete = reverse("user:delete_user_account")
        self.valid_data = {
            "email": "newuser@example.com",
            "phone_number": "123456789",
            "name": "New User",
            "id_number": "87654321X",
            "rol": 0,
            "password": "securepassword123",
            "token": "testtoken",
        }
        self.user = User.objects.create(**self.valid_data)

    def test_get_user(self):
        response = self.client.get(self.url_get, HTTP_AUTHORIZATION=f"Token {self.user.token}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["email"], self.user.email)
        self.assertEqual(response.data[0]["phone_number"], self.user.phone_number)
        self.assertEqual(response.data[0]["name"], self.user.name)
        self.assertEqual(response.data[0]["id_number"], self.user.id_number)
