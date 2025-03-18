from decimal import Decimal

from django.test import TestCase
from users.models import User

from .models import Account


# Create your tests here.
class AccountTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        """Executed once for all tests of the class."""
        cls.user = User.objects.create(
            email="user@test.com",
            phone="123456789",
            name="Test User",
            id_number="123456789",
            password="testpassword",
        )

    def test_account_creation(self) -> None:
        # Create a new account for the user
        account = Account.objects.create(user=self.user)

        # Verify that the account was created
        self.assertEqual(account.user, self.user)
        self.assertEqual(account.balance, Decimal("0.00"))

    def test_repeated_account_creation(self) -> None:
        Account.objects.create(user=self.user)

        # Attempt to create a new account for the same user
        with self.assertRaises(Exception):
            Account.objects.create(user=self.user)
