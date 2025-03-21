from django.test import TestCase
from users.models import User

from .models import CreditCard


class CreditCardTest(TestCase):
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

    def create_credit_card(self, **kwargs) -> CreditCard:
        # Auxiliary method to create a credit card
        defaults = {
            "number": "1234567890123456",
            "expiration_date": "06/26",
            "cvv": "123",
            "user": self.user,
            "owner_name": "Test User",
            "card_alias": "Test Card",
            "is_default": True,
        }
        defaults.update(kwargs)
        return CreditCard.objects.create(**defaults)

    def test_credit_card_creation(self) -> None:
        credit_card = self.create_credit_card()

        self.assertEqual(credit_card.number, "1234567890123456")
        self.assertEqual(credit_card.expiration_date, "06/26")
        self.assertEqual(credit_card.cvv, "123")
        self.assertEqual(credit_card.user, self.user)
        self.assertEqual(credit_card.owner_name, "Test User")
        self.assertEqual(credit_card.card_alias, "Test Card")
        self.assertTrue(credit_card.is_default)

    def test_incorrect_expiration_date(self) -> None:
        with self.assertRaises(Exception):
            self.create_credit_card(expiration_date="2026-06-30")

    def test_repeated_default_card(self) -> None:
        self.create_credit_card(is_default=True)

        with self.assertRaises(Exception):
            self.create_credit_card(is_default=True)
