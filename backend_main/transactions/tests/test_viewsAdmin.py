from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User

from transactions.models import Transaction


class TransactionListViewTests(APITestCase):
    def setUp(self) -> None:
        # Create test users
        self.password = "password123"
        self.user1 = User.objects.create_user(
            email="user1@test.com",
            phone="123456789",
            name="User One",
            id_number="111111111",
            password=self.password,
            is_confirmed=True,
        )
        self.user2 = User.objects.create_user(
            email="user2@test.com",
            phone="987654321",
            name="User Two",
            id_number="222222222",
            password=self.password,
            is_confirmed=True,
        )

        # Add money to user accounts
        self.user1.account.balance = 10000
        self.user1.account.save()
        self.user2.account.balance = 10000
        self.user2.account.save()

        # Create test transactions
        self.transaction1 = Transaction.objects.create(
            sender=self.user1,
            receiver=self.user2,
            amount=2,
            status="approved",
            title="Sample send",
            type="send",
        )
        self.transaction2 = Transaction.objects.create(
            sender=self.user1,
            receiver=self.user2,
            amount=3,
            status="pending",
            title="Sample request",
            type="request",
        )
        self.url_list = reverse("transaction_list")
        self.token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def get_token(self):
        data = {"email": self.user1.email, "password": self.password}
        response = self.client.post(reverse("user:login_user"), data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["access"]

    def test_transaction_list_no_filters(self):
        response = self.client.get(self.url_list)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)

    def test_transaction_list_filter_by_status(self):
        response = self.client.get(self.url_list, {"status": "approved"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["status"], "approved")

    def test_transaction_list_filter_by_amount_range(self):
        response = self.client.get(self.url_list, {"min_amount": 1, "max_amount": 2.50})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["amount"], "2.00")

    def test_transaction_list_pagination(self):
        response = self.client.get(self.url_list, {"limit": 1})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertIn("next", response.data)
        self.assertIn("previous", response.data)
