from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User

from account.models import Account


class AccountTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@test.com",
            phone="123456789",
            name="Test User",
            id_number="123456789",
            password="testpassword",
        )
        self.token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        self.account_url = reverse("account:get-account")  
        self.account = Account.objects.create(user=self.user, balance=Decimal("100.00"))

    def get_token(self):
        data = {"email": self.user.email, "password": "testpassword"}
        response = self.client.post(reverse("user:login_user"), data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["access"]

    def test_create_account(self):
        self.assertEqual(self.account.user, self.user)
        self.assertEqual(self.account.balance, Decimal("100.00"))

    def test_get_account(self):
        response = self.client.get(self.account_url)  
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["balance"], "100.00")  # Se serializa como string
        self.assertIn("updated_at", response.data)

    def test_create_duplicate_account(self):
        with self.assertRaises(Exception):  
            Account.objects.create(user=self.user, balance=Decimal("200.00"))

    def test_get_account_without_creating_one(self):
        self.account.delete()  
        response = self.client.get(self.account_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Account not found")
