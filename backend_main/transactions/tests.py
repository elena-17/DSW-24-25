from django.test import TestCase
from users.models import User

from .models import MoneyRequest, Transaction


class TransactionTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        """Executed once for all tests of the class."""
        cls.user1 = User.objects.create(
            email="user@test.com",
            phone="123456789",
            name="Test User",
            id_number="123456789",
            password="testpassword",
        )
        cls.user2 = User.objects.create(
            email="user2@test.com",
            phone="987654321",
            name="Test User2",
            id_number="987654321",
            password="testpassword",
        )

    def test_transaction_creation(self) -> None:
        transaction = Transaction.objects.create(
            sender=self.user1,
            receiver=self.user2,
            amount=100,
            title="Test transaction",
            description="Test transaction description",
        )

        self.assertEqual(transaction.sender, self.user1)
        self.assertEqual(transaction.receiver, self.user2)
        self.assertEqual(transaction.amount, 100)
        self.assertEqual(transaction.title, "Test transaction")
        self.assertEqual(transaction.description, "Test transaction description")


class MoneyRequestTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        """Executed once for all tests of the class."""
        cls.user1 = User.objects.create(
            email="user@test.com",
            phone="123456789",
            name="Test User",
            id_number="123456789",
            password="testpassword",
        )
        cls.user2 = User.objects.create(
            email="user2@test.com",
            phone="987654321",
            name="Test User2",
            id_number="987654321",
            password="testpassword",
        )

    def test_money_request_creation(self) -> None:
        money_request = MoneyRequest.objects.create(
            request_from=self.user1,
            request_to=self.user2,
            amount=100,
            title="Test money request",
            description="Test money request description",
        )

        self.assertEqual(money_request.request_from, self.user1)
        self.assertEqual(money_request.request_to, self.user2)
        self.assertEqual(money_request.amount, 100)
        self.assertEqual(money_request.title, "Test money request")
        self.assertEqual(money_request.description, "Test money request description")
        self.assertEqual(money_request.status, "pending")

    def test_money_request_approve(self) -> None:
        money_request = MoneyRequest.objects.create(
            request_from=self.user1,
            request_to=self.user2,
            amount=100,
            title="Test money request",
            description="Test money request description",
        )

        money_request.approve()

        self.assertEqual(money_request.status, "approved")
        self.assertEqual(Transaction.objects.count(), 1)
        transaction = Transaction.objects.first()
        self.assertEqual(transaction.sender, self.user2)
        self.assertEqual(transaction.receiver, self.user1)
        self.assertEqual(transaction.amount, 100)
        self.assertEqual(transaction.title, "Test money request")
        self.assertEqual(transaction.description, "Test money request description")
