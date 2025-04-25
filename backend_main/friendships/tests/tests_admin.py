from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User

from ..models import Favorite


class FavoriteAdminTest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            email="admin@test.com",
            phone="111222333",
            name="Admin User",
            id_number="000000000",
            password="adminpass",
            is_confirmed=True,
        )
        self.user1 = User.objects.create_user(
            email="user1@test.com",
            phone="444555666",
            name="Normal User1",
            id_number="111111111",
            password="userpass",
            is_confirmed=True,
        )
        self.user2 = User.objects.create_user(
            email="user2@test.com",
            phone="777888999",
            name="Normal User2",
            id_number="222222222",
            password="userpass",
            is_confirmed=True,
        )

        self.token = self.get_token(self.admin.email, "adminpass")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

        self.admin_all_url = reverse("favorites:get-all-favorite-pairs")
        self.admin_add_url = reverse("favorites:admin-add-favorite-relation")
        self.admin_remove_url = reverse("favorites:admin-remove-favorite-relation")

    def get_token(self, email, password):
        data = {"email": email, "password": password}
        response = self.client.post(reverse("user:login_user"), data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["access"]

    def test_admin_add_favorite(self):
        """Admin can create a favorite relation between users"""
        response = self.client.post(self.admin_add_url, {"user": self.user1.email, "favorite_user": self.user2.email})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Favorite.objects.filter(user=self.user1, favorite_user=self.user2).exists())

    def test_admin_add_favorite_self(self):
        """Admin cannot make a user favorite themselves"""
        response = self.client.post(self.admin_add_url, {"user": self.user1.email, "favorite_user": self.user1.email})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_add_favorite_missing_user(self):
        """Admin fails if one of the users doesn't exist"""
        response = self.client.post(self.admin_add_url, {"user": "noexist@test.com", "favorite_user": self.user2.email})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_get_all_favorites(self):
        """Admin can fetch all favorite pairs with pagination"""
        Favorite.objects.create(user=self.user1, favorite_user=self.user2)

        # Agrega los parámetros de paginación esperados por el backend
        response = self.client.get(self.admin_all_url, {"limit": 10, "offset": 0})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("data", response.data)
        self.assertIn("total", response.data)
        self.assertEqual(response.data["total"], 1)
        self.assertEqual(len(response.data["data"]), 1)
        self.assertEqual(response.data["data"][0]["user"], self.user1.email)
        self.assertEqual(response.data["data"][0]["favorite_user"], self.user2.email)

    def test_admin_remove_favorite(self):
        """Admin can remove a favorite relation"""
        Favorite.objects.create(user=self.user1, favorite_user=self.user2)
        response = self.client.delete(
            self.admin_remove_url, {"user": self.user1.email, "favorite_user": self.user2.email}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Favorite.objects.filter(user=self.user1, favorite_user=self.user2).exists())

    def test_admin_remove_nonexistent_relation(self):
        """Admin attempts to remove a non-existent favorite relation"""
        response = self.client.delete(
            self.admin_remove_url, {"user": self.user1.email, "favorite_user": self.user2.email}
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
