from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User

from ..models import Favorite


class FavoriteTest(APITestCase):
    def setUp(self):
        """Executed once for all tests of the class."""
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
        self.get_favorite_users_url = reverse("favorites:get-favorite-users")
        self.add_to_favorites_url = reverse("favorites:add-to-favorites")
        self.remove_from_favorites_url = reverse("favorites:remove-from-favorites")
        self.get_non_favorite_users_url = reverse("favorites:get-non-favorite-users")

    def get_token(self):
        data = {"email": self.user1.email, "password": "testpassword"}
        response = self.client.post(reverse("user:login_user"), data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["access"]

    def test_add_to_favorites(self):
        """Test that user1 can add user2 to their favorites"""
        response = self.client.post(self.add_to_favorites_url, data={"email": self.user2.email})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Verify that the favorite relationship was created
        favorite = Favorite.objects.filter(user=self.user1, favorite_user=self.user2).first()
        self.assertIsNotNone(favorite)

    def test_add_to_favorites_duplicate(self):
        """Test that adding the same favorite again does not create duplicate entries"""
        Favorite.objects.create(user=self.user1, favorite_user=self.user2)
        response = self.client.post(self.add_to_favorites_url, data={"email": self.user2.email})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # VerifY that the count of favorites is still 1
        self.assertEqual(Favorite.objects.filter(user=self.user1, favorite_user=self.user2).count(), 1)

    def test_add_to_favorites_self(self):
        """Test that a user cannot add themselves to favorites"""
        response = self.client.post(self.add_to_favorites_url, data={"email": self.user1.email})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Cannot favorite yourself")

    def test_get_favorite_users(self):
        """Test that user1 can view their favorite users"""
        Favorite.objects.create(user=self.user1, favorite_user=self.user2)
        response = self.client.get(self.get_favorite_users_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["email"], self.user2.email)

    def test_non_favorite_users(self):
        """Test that user1 sees only non-favorite users"""
        # Agregamos user2 como favorito de user1
        Favorite.objects.create(user=self.user1, favorite_user=self.user2)
        # Hacemos la petición al endpoint
        response = self.client.get(self.get_non_favorite_users_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Extraemos los correos de los usuarios devueltos
        emails = [user["email"] for user in response.data]
        # user3 debería estar, user2 (favorito) no, y user1 (autenticado) tampoco
        self.assertIn(self.user3.email, emails)
        self.assertNotIn(self.user2.email, emails)
        self.assertNotIn(self.user1.email, emails)

    def test_remove_from_favorites(self):
        """Test that user1 can remove user2 from their favorites"""
        Favorite.objects.create(user=self.user1, favorite_user=self.user2)
        response = self.client.delete(self.remove_from_favorites_url, data={"email": self.user2.email})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify that the favorite relationship was deleted
        self.assertFalse(Favorite.objects.filter(user=self.user1, favorite_user=self.user2).exists())

    def test_remove_from_favorites_not_favorite(self):
        """Test that trying to remove a non-favorite user returns an error"""
        response = self.client.delete(self.remove_from_favorites_url, data={"email": self.user2.email})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Favorite user not found")

    def test_remove_from_favorites_user_not_found(self):
        """Test that trying to remove a user who does not exist returns an error"""
        response = self.client.delete(self.remove_from_favorites_url, data={"email": "nonexistent@test.com"})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Favorite user not found")
