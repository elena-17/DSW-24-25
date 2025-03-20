from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User


class UserTestCase(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create(
            email="test@example.com",
            phone="1234567890",
            name="Test User",
            id_number="12345678X",
            role="user",
            password="securepassword123",
        )

    def test_user_creation(self) -> None:
        self.assertEqual(self.user.email, "test@example.com")
        self.assertEqual(self.user.phone, "1234567890")
        self.assertEqual(self.user.name, "Test User")
        self.assertEqual(self.user.id_number, "12345678X")
        self.assertEqual(self.user.role, "user")


class UserAPI(APITestCase):

    def setUp(self) -> None:
        self.url_get = reverse("user:get_user_profile")
        self.url_update = reverse("user:update_user_profile")
        self.url_delete = reverse("user:delete_user_account")
        self.valid_data = {
            "email": "newuser@example.com",
            "phone": "123456789",
            "name": "New User",
            "id_number": "87654321X",
            "password": "securepassword123",
            "role": "user",
        }
        self.user = User.objects.create_user(**self.valid_data)
        self.assertTrue(User.objects.filter(email=self.valid_data["email"]).exists())
        self.token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def get_token(self):
        data = {"email": self.user.email, "password": "securepassword123"}
        response = self.client.post(reverse("user:login_user"), data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["access"]

    def test_get_user(self):
        response = self.client.get(self.url_get)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)
        self.assertEqual(response.data["phone"], self.user.phone)
        self.assertEqual(response.data["name"], self.user.name)
        self.assertEqual(response.data["id_number"], self.user.id_number)

    def test_update_user_profile(self):
        update_data = {
            "name": "Updated User",
            "phone": "987654321",
        }
        response = self.client.put(self.url_update, data=update_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, update_data["name"])
        self.assertEqual(self.user.phone, update_data["phone"])
        print(response.data)
        print(self.user.name)

    def test_delete_user_account(self):
        response = self.client.delete(self.url_delete)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id_number=self.user.id_number).exists())
