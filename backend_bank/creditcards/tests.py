from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from creditcards.models import CreditCard


class CreditCardTestCase(APITestCase):
    def setUp(self):
        self.valid_card = CreditCard.objects.create(
            number="123456789", owner_name="John Doe", expiration_date="2025-12-31", cvv="123"
        )
        self.url = reverse("creditcards:validate_credit_card")

    def test_valid_card_should_return_true(self):
        """valid card should return true"""
        data = {"number": "123456789", "owner_name": "John Doe", "expiration_date": "2025-12-31", "cvv": "123"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"valid": True})

    def test_invalid_card_should_return_false(self):
        """Card data is not valid (ex. date)"""
        data = {"number": "123456789", "owner_name": "John Doe", "expiration_date": "2026-11-30", "cvv": "123"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"valid": False})

    def test_invalid_payload_should_return_400(self):
        """Invalid payload should return 400"""
        data = {"number": "1234567812345678", "owner_name": "John Doe", "expiration_date": "2025-12-31"}  # Falta el CVV
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("cvv", response.data)

    def test_valid_expiration_date(self) -> None:
        """Expiration date is in a valid format"""
        data = {"number": "123456789", "owner_name": "John Doe", "expiration_date": "2025-12-31", "cvv": "123"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"valid": True})

    def test_invalid_expiration_date(self) -> None:
        """Expiration date is in an invalid format"""
        data = {"number": "123456789", "owner_name": "John Doe", "expiration_date": "31-12-2025", "cvv": "123"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("expiration_date", response.data)
