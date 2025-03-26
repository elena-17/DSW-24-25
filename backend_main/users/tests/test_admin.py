from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User

class UserAPI(APITestCase):
    def setUp(self) -> None:
        # Create two users for testing
        self.user1 = User.objects.create_user(
            email="user1@example.com",
            phone="1111111111",
            name="User One",
            id_number="12345678A",
            password="password123",
            role="user",
        )
        self.user2 = User.objects.create_user(
            email="user2@example.com",
            phone="2222222222",
            name="User Two",
            id_number="87654321B",
            password="password123",
            role="user",
        )

        # Create an admin user to generate the token for authentication
        self.admin = User.objects.create_user(
            email="admin@example.com",
            phone="3333333333",
            name="Admin User",
            id_number="11223344C",
            password="adminpassword123",
            role="admin",
        )

        # Define the URLs for the test cases
        self.url_get_all = reverse("user:get_all_users")  # URL for getting all users
        self.url_bulk_delete = reverse("user:bulk_delete")  # URL for bulk delete
        self.url_register_user = reverse("user:register_user")  # URL for user registration
        self.url_get_user_profile = reverse("user:get_user_profile")  # URL for getting user profile
        self.url_update_user_profile = reverse("user:update_user_profile")  # URL for updating user profile
        self.url_delete_user_account = reverse("user:delete_user_account")  # URL for deleting user account
        
        # Get the token for the admin user and set it as the authorization header
        self.token = self.get_token(self.admin)  # Use admin credentials to generate the token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
    
    def get_token(self, user):
        # Helper function to get token for the user
        data = {"email": user.email, "password": "adminpassword123"}
        response = self.client.post(reverse("user:login_user"), data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["access"]
    
    def test_get_all_users(self):
        # Test that all users are retrieved successfully
        response = self.client.get(self.url_get_all)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify that the response contains all users
        self.assertEqual(len(response.data), 3)
        self.assertEqual(response.data[0]["email"], self.user1.email)
        self.assertEqual(response.data[1]["email"], self.user2.email)
        self.assertEqual(response.data[2]["email"], self.admin.email)
        self.assertEqual(response.data[0]["name"], self.user1.name)
        self.assertEqual(response.data[1]["name"], self.user2.name)
        self.assertEqual(response.data[2]["name"], self.admin.name)
        self.assertEqual(response.data[0]["id_number"], self.user1.id_number)
        self.assertEqual(response.data[1]["id_number"], self.user2.id_number)
        self.assertEqual(response.data[2]["id_number"], self.admin.id_number)

    def test_bulk_delete_users(self):
        # Test that the admin can delete multiple users by their email addresses
        users_to_delete = [self.user1.email, self.user2.email]  # Usamos los correos electrónicos
        data = {"emails": users_to_delete}  # Enviamos los correos electrónicos en la solicitud
        response = self.client.delete(self.url_bulk_delete, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify that the users are deleted
        self.assertEqual(User.objects.count(), 1)
        self.assertFalse(User.objects.filter(email=self.user1.email).exists()) 
        self.assertFalse(User.objects.filter(email=self.user2.email).exists()) 

    def test_register_user(self):
        # Test that the admin can register a new user
        new_user_data = {
            "email": "newuser@example.com",
            "phone": "5555555555",
            "name": "New User",
            "id_number": "11223344D",
            "password": "newpassword123",
            "role": "user",
        }
        response = self.client.post(self.url_register_user, new_user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify that the new user is created
        self.assertTrue(User.objects.filter(email="newuser@example.com").exists())
    
    '''
    def test_update_user_profile(self):
        # Test that the admin can update user details
        update_data = {
            "name": "Updated User",
            "phone": "987654321",
        }
        self.url_update_user_profile = reverse("user:update_user_profile", kwargs={"email": self.user1.email})
        response = self.client.put(self.url_update_user_profile, data=update_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify that the user details are updated
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.name, update_data["name"])
        self.assertEqual(self.user1.phone, update_data["phone"])

    def test_delete_user_account(self):
        # Test that the admin can delete a user
        url_delete_user = reverse("user:delete_user_account", kwargs={"pk": self.user1.id})
        response = self.client.delete(url_delete_user)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify that the user is deleted
        self.assertFalse(User.objects.filter(id=self.user1.id).exists())
'''