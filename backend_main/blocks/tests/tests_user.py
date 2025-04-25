from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User
from ..models import Block

class BlockTest(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email="user1@test.com",
            phone="123456789",
            name="Test User1",
            id_number="123456789",
            password="testpassword",
            is_confirmed=True,
        )
        self.user2 = User.objects.create_user(
            email="user2@test.com",
            phone="987654321",
            name="Test User2",
            id_number="987654321",
            password="testpassword",
            is_confirmed=True,
        )
        self.user3 = User.objects.create_user(
            email="user3@test.com",
            phone="456789123",
            name="Test User3",
            id_number="456789123",
            password="testpassword",
            is_confirmed=True,
        )
        self.token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        self.get_blocked_users_url = reverse("blocks:get-blocked-users")
        self.block_user_url = reverse("blocks:block-user")
        self.unblock_user_url = reverse("blocks:unblock-user")
        self.get_unblocked_users_url = reverse("blocks:get-non-blocked-users")

    def get_token(self):
        data = {"email": self.user1.email, "password": "testpassword"}
        response = self.client.post(reverse("user:login_user"), data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["access"]

    def test_block_user(self):
        """User can block another user"""
        response = self.client.post(self.block_user_url, data={"email": self.user2.email})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Block.objects.filter(user=self.user1, blocked_user=self.user2).exists())

    def test_block_user_duplicate(self):
        """Blocking the same user twice should not create duplicates"""
        Block.objects.create(user=self.user1, blocked_user=self.user2)
        response = self.client.post(self.block_user_url, data={"email": self.user2.email})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Block.objects.filter(user=self.user1, blocked_user=self.user2).count(), 1)

    def test_block_self(self):
        """User cannot block themselves"""
        response = self.client.post(self.block_user_url, data={"email": self.user1.email})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Cannot block yourself")

    def test_get_blocked_users(self):
        """User can see who they have blocked"""
        Block.objects.create(user=self.user1, blocked_user=self.user2)
        response = self.client.get(self.get_blocked_users_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["email"], self.user2.email)

    def test_get_unblocked_users(self):
        """User sees users they haven't blocked"""
        Block.objects.create(user=self.user1, blocked_user=self.user2)
        response = self.client.get(self.get_unblocked_users_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        emails = [user["email"] for user in response.data]
        self.assertIn(self.user3.email, emails)
        self.assertNotIn(self.user2.email, emails)
        self.assertNotIn(self.user1.email, emails)

    def test_unblock_user(self):
        """User can unblock a previously blocked user"""
        Block.objects.create(user=self.user1, blocked_user=self.user2)
        response = self.client.delete(self.unblock_user_url, data={"email": self.user2.email})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Block.objects.filter(user=self.user1, blocked_user=self.user2).exists())

    def test_unblock_user_not_blocked(self):
        """Trying to unblock a user who wasn't blocked returns an error"""
        response = self.client.delete(self.unblock_user_url, data={"email": self.user2.email})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Blocked user not found")

    def test_unblock_user_not_found(self):
        """Trying to unblock a non-existent user returns an error"""
        response = self.client.delete(self.unblock_user_url, data={"email": "nonexistent@test.com"})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Blocked user not found")
