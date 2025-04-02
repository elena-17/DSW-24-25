from django.test import TestCase
from users.models import User

from transactions.models import Transaction


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
            type="send",
        )

        self.assertEqual(transaction.sender, self.user1)
        self.assertEqual(transaction.receiver, self.user2)
        self.assertEqual(transaction.amount, 100)
        self.assertEqual(transaction.title, "Test transaction")
        self.assertEqual(transaction.description, "Test transaction description")
        self.assertEqual(transaction.status, "pending")
        self.assertEqual(transaction.type, "send")
