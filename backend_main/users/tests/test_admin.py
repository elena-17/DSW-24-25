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
        self.url_list_users = reverse("user:user-list")  # GET /users/
        self.url_bulk_delete = reverse("user:user-bulk-delete")  # DELETE /users/bulk-delete/
        self.url_register_user = reverse("user:register_user")  # POST /register/
        self.url_get_user_by_email = lambda email: reverse(
            "user:user-get-by-email", kwargs={"email": email}
        )  # GET /users/get/{email}/
        self.url_update_user_by_email = lambda email: reverse(
            "user:user-update-by-email", kwargs={"email": email}
        )  # PUT /users/update/{email}/
        self.url_delete_user = lambda email: reverse(
            "user:user-delete", kwargs={"email": email}
        )  # DELETE /users/{email}/

        # Get the token for the admin user and set it as the authorization header
        self.token = self.get_token(self.admin)  # Use admin credentials to generate the token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def get_token(self, user):
        # Helper function to get token for the user
        data = {"email": user.email, "password": "adminpassword123"}
        response = self.client.post(reverse("user:login_user"), data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["access"]

    def test_list_users(self):
        # Test that the admin can get a list of all users
        response = self.client.get(self.url_list_users)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)  # 3 usuarios en total (user1, user2, admin)

        # Verify user details in the response
        emails = [user["email"] for user in response.data]
        self.assertIn(self.user1.email, emails)
        self.assertIn(self.user2.email, emails)
        self.assertIn(self.admin.email, emails)

    # def test_get_user_by_email(self):
    #     # Test that the admin can get a user by email
    #     response = self.client.get(self.url_get_user_by_email(self.user1.email))
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertEqual(response.data["email"], self.user1.email)

    def test_update_user_by_email(self):
        # Test that the admin can update user details by email
        updated_data = {
            "name": "Updated User One",
            "phone": "9999999999",
            "password": "newpassword123",
        }
        response = self.client.put(self.url_update_user_by_email(self.user1.email), updated_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify that the user details are updated
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.name, "Updated User One")
        self.assertEqual(self.user1.phone, "9999999999")
        self.assertTrue(self.user1.check_password("newpassword123"))

    def test_bulk_delete_users(self):
        # Test that the admin can delete multiple users at once
        data = {"emails": [self.user1.email, self.user2.email]}
        response = self.client.delete(self.url_bulk_delete, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify that the users are deleted
        self.assertEqual(User.objects.count(), 1)  # Solo debería quedar el admin
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

    def test_delete_user(self):
        # Test that the admin can delete a user by email
        response = self.client.delete(self.url_delete_user(self.user1.email))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify that the user is deleted
        self.assertFalse(User.objects.filter(email=self.user1.email).exists())
