from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from creditcards.models import CreditCard


class CreditCardTestCase(APITestCase):
    def setUp(self):
        self.valid_card = CreditCard.objects.create(
            number="123456789", owner_name="John Doe", expiration_date="06/26", cvv="123"
        )
        self.url = reverse("creditcards:validate_credit_card")

    def test_valid_card_should_return_true(self):
        """valid card should return true"""
        data = {
            "number": "123456789",
            "owner_name": "John Doe",
            "expiration_date": "06/26",
            "cvv": "123",
            "amount": "1000",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"valid": True})

    def test_invalid_card_should_return_false(self):
        """Card data is not valid (ex. date)"""
        data = {
            "number": "123456789",
            "owner_name": "John Doe",
            "expiration_date": "07/27",
            "cvv": "123",
            "amount": "1000",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"valid": False})

    def test_invalid_payload_should_return_400(self):
        """Invalid payload should return 400"""
        data = {
            "number": "1234567812345678",
            "owner_name": "John Doe",
            "expiration_date": "06/26",
            "amount": "1000",
        }  # Falta el CVV
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("cvv", response.data)

    def test_invalid_expiration_date(self) -> None:
        """Expiration date is in an invalid format"""
        data = {
            "number": "123456789",
            "owner_name": "John Doe",
            "expiration_date": "31-12-2025",
            "cvv": "123",
            "amount": "1000",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("expiration_date", response.data)

    def test_amount_exceeds_limit(self) -> None:
        """Transaction amount exceeds the limit"""
        data = {
            "number": "123456789",
            "owner_name": "John Doe",
            "expiration_date": "06/26",
            "cvv": "123",
            "amount": Decimal("2000.01"),
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data, {"valid": False, "message": "Transaction amount exceeds the limit"})
