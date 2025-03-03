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
        """Prueba que una tarjeta válida"""
        data = {"number": "123456789", "owner_name": "John Doe", "expiration_date": "2025-12-31", "cvv": "123"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"valid": True})

    def test_invalid_card_should_return_false(self):
        """Prueba que una no es valida en cualquiera de sus campos (fecha)"""
        data = {"number": "123456789", "owner_name": "John Doe", "expiration_date": "2026-11-30", "cvv": "123"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"valid": False})

    def test_invalid_payload_should_return_400(self):
        """Prueba que si falta un campo, se devuelva error 400."""
        data = {"number": "1234567812345678", "owner_name": "John Doe", "expiration_date": "2025-12-31"}  # Falta el CVV
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
