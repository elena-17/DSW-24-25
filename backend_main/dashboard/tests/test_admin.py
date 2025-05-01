from unittest.mock import patch
from django.urls import reverse
from users.models import User
from creditcard.models import CreditCard

from account.models import Account
from friendships.models import Favorite
from transactions.models import Transaction
from blocks.models import Block
from rest_framework import status
from rest_framework.test import APITestCase


class AdminDashboardViewTests(APITestCase):
    def setUp(self):
        # Create test users
        self.admin_user = User.objects.create_user(
            email="admin@test.com",
            phone="123456789",
            name="Admin User",
            id_number="111111111",
            password="password123",
            is_confirmed=True,
            role="admin",
        )
        self.regular_user = User.objects.create_user(
            email="user@test.com",
            phone="987654321",
            name="Regular User",
            id_number="222222222",
            password="password123",
            is_confirmed=True,
        )

        # Create test accounts
        self.admin_user.account.balance = 5000
        self.admin_user.account.save()
        self.regular_user.account.balance = 10000
        self.regular_user.account.save()

        # Create test credit cards
        CreditCard.objects.create(user=self.admin_user, number="1234567890123456")
        CreditCard.objects.create(
            user=self.regular_user, number="9876543210987654"
        )

        # Create test favorites
        Favorite.objects.create(user=self.admin_user, favorite_user=self.regular_user)

        # Create test transactions
        self.transaction1 = Transaction.objects.create(
            sender=self.admin_user,
            receiver=self.regular_user,
            amount=100,
            status="approved",
            title="Test Transaction 1",
            type="send",
        )
        self.transaction2 = Transaction.objects.create(
            sender=self.regular_user,
            receiver=self.admin_user,
            amount=200,
            status="pending",
            title="Test Transaction 2",
            type="request",
        )

        self.url = reverse("dashboard-admin")
        self.token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def get_token(self):
        data = {"email": self.regular_user.email, "password": "password123"}
        response = self.client.post(reverse("user:login_user"), data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["access"]


    @patch("dashboard.views.viewsAdmin.get_transactions_per_day")
    def test_admin_dashboard_success(self, mock_get_transactions_per_day):
        mock_get_transactions_per_day.return_value = [
            {"day": "01", "count": 1, "total_amount": 100},
            {"day": "02", "count": 1, "total_amount": 200},
        ]

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertEqual(data["total_users"], 2)
        self.assertEqual(data["favorites"], 1)
        self.assertEqual(data["blocks"], 0)
        self.assertEqual(data["admins"], 1)
        self.assertEqual(data["total_transactions"], 2)
        self.assertEqual(data["pending_transactions"], 1)
        self.assertEqual(data["approved_transactions"], 1)
        self.assertEqual(data["total_money_in_accounts"], 15000)
        self.assertEqual(data["average_account_balance"], 7500)
        self.assertEqual(data["num_credit_cards"], 2)
        self.assertEqual(
            data["transactions_chart"], mock_get_transactions_per_day.return_value
        )

    def test_admin_dashboard_no_transactions(self):
        Transaction.objects.all().delete()

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertEqual(data["total_transactions"], 0)
        self.assertEqual(data["pending_transactions"], 0)
        self.assertEqual(data["approved_transactions"], 0)
