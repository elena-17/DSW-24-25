from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User

from ..models import Block


class BlockAdminTest(APITestCase):
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

        self.admin_all_url = reverse("blocks:get-all-block-pairs")
        self.admin_add_url = reverse("blocks:admin-add-block-relation")
        self.admin_remove_url = reverse("blocks:admin-remove-block-relation")

    def get_token(self, email, password):
        data = {"email": email, "password": password}
        response = self.client.post(reverse("user:login_user"), data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["access"]

    def test_admin_add_block(self):
        """Admin can create a block relation between users"""
        response = self.client.post(self.admin_add_url, {"user": self.user1.email, "blocked_user": self.user2.email})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Block.objects.filter(user=self.user1, blocked_user=self.user2).exists())

    def test_admin_add_block_self(self):
        """Admin cannot make a user block themselves"""
        response = self.client.post(self.admin_add_url, {"user": self.user1.email, "blocked_user": self.user1.email})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_add_block_missing_user(self):
        """Admin fails if one of the users doesn't exist"""
        response = self.client.post(self.admin_add_url, {"user": "noexist@test.com", "blocked_user": self.user2.email})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_get_all_blocks(self):
        """Admin can fetch all block pairs with pagination"""
        Block.objects.create(user=self.user1, blocked_user=self.user2)

        response = self.client.get(self.admin_all_url, {"limit": 10, "offset": 0})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("data", response.data)
        self.assertIn("total", response.data)
        self.assertEqual(response.data["total"], 1)
        self.assertEqual(len(response.data["data"]), 1)
        self.assertEqual(response.data["data"][0]["user"], self.user1.email)
        self.assertEqual(response.data["data"][0]["blocked_user"], self.user2.email)

    def test_admin_remove_block(self):
        """Admin can remove a block relation"""
        Block.objects.create(user=self.user1, blocked_user=self.user2)
        response = self.client.delete(
            self.admin_remove_url, {"user": self.user1.email, "blocked_user": self.user2.email}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Block.objects.filter(user=self.user1, blocked_user=self.user2).exists())

    def test_admin_remove_nonexistent_block(self):
        """Admin attempts to remove a non-existent block relation"""
        response = self.client.delete(
            self.admin_remove_url, {"user": self.user1.email, "blocked_user": self.user2.email}
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
