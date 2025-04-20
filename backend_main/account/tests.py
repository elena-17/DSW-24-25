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
            is_confirmed=True,
        )
        self.token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        self.account_url = reverse("account:get-account")
        self.recharge_url = reverse("account:adding-money")
        self.withdraw_url = reverse("account:subtracting-money")
        self.get_accounts = reverse("account:get-accounts")
        self.update_account_balance = reverse("account:update-account-balance")

        self.account, created = Account.objects.get_or_create(user=self.user, defaults={"balance": Decimal("0.00")})

    def get_token(self):
        data = {"email": self.user.email, "password": "testpassword"}
        response = self.client.post(reverse("user:login_user"), data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["access"]

    def test_create_account(self):
        self.assertEqual(self.account.user, self.user)
        self.assertEqual(self.account.balance, Decimal("0.00"))

    def test_get_account(self):
        response = self.client.get(self.account_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["balance"], "0.00")
        self.assertIn("updated_at", response.data)

    def test_create_duplicate_account(self):
        with self.assertRaises(Exception):
            Account.objects.create(user=self.user, balance=Decimal("200.00"))

    def test_get_account_without_creating_one(self):
        self.account.delete()
        response = self.client.get(self.account_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Account not found")

    def test_add_money_to_account(self):
        response = self.client.put(self.recharge_url, {"amount": "150.00"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.account.refresh_from_db()
        self.assertEqual(self.account.balance, Decimal("150.00"))

    def test_subtract_money_from_account(self):
        self.account.balance = Decimal("200.00")
        self.account.save()
        response = self.client.put(self.withdraw_url, {"amount": "50.00"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.account.refresh_from_db()
        self.assertEqual(self.account.balance, Decimal("150.00"))
        response = self.client.put(self.withdraw_url, {"amount": "200.00"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Insufficient funds")

    def test_get_all_accounts(self):
        response = self.client.get(self.get_accounts)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["user"], self.user.email)  # El correo electrónico ahora debe coincidir.
        self.assertEqual(Decimal(response.data[0]["balance"]), Decimal("0.00"))

    def test_update_account_balance(self):
        response = self.client.put(self.update_account_balance, {"email": self.user.email, "amount": "500.00"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.account.refresh_from_db()
        self.assertEqual(self.account.balance, Decimal("500.00"))
        self.assertEqual(response.data["balance"], "500.00")
        self.assertEqual(response.data["user"], self.user.email)

    def test_update_account_negative(self):
        response = self.client.put(self.update_account_balance, {"email": self.user.email, "amount": "-500.00"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["amount"], "Amount must be positive")
