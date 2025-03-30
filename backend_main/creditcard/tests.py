from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User

from creditcard.models import CreditCard


class CreditCardAPITests(APITestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(
            email="testuser@example.com",
            phone="123456789",
            name="Test User",
            id_number="12345678X",
            password="testpassword",
            role="user",
        )
        self.token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

        self.credit_card = CreditCard.objects.create(
            number="1234567812345678",
            user=self.user,
            owner_name="Test User",
            expiration_date="12/25",
            card_alias="Main Card",
        )

        self.credit_card_2 = CreditCard.objects.create(
            number="8765432187654321",
            user=self.user,
            owner_name="Test User",
            expiration_date="12/26",
            card_alias="Secondary Card",
        )

        self.url_list = reverse("creditcard:creditcard-list")
        self.url_create = reverse("creditcard:creditcard-create")
        self.url_update = reverse("creditcard:creditcard-update")
        self.url_delete = reverse("creditcard:creditcard-delete")
        print(f"🔍 Creando tarjetas para usuario ID: {self.user.id_number}")
        print(f"🔍 Tarjetas en la BD: {list(CreditCard.objects.all().values('number', 'user_id'))}")

    def get_token(self):
        data = {"email": self.user.email, "password": "testpassword"}
        response = self.client.post(reverse("user:login_user"), data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["access"]

    def test_get_creditcards(self):
        response = self.client.get(self.url_list)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["number"], self.credit_card.number)
        self.assertEqual(response.data[1]["number"], self.credit_card_2.number)

    def test_get_creditcard_not_found(self):
        response = self.client.get(self.url_list, {"number": "0000000000000000"})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Credit card not found or you do not have permission.")

    def test_post_creditcard(self):
        data = {
            "number": "8765432187654321",
            "owner_name": "Test User 2",
            "expiration_date": "12/26",
            "card_alias": "Secondary Card",
        }
        response = self.client.post(self.url_create, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["number"], data["number"])

    def test_post_creditcard_missing_number(self):
        data = {"owner_name": "Test User 3", "expiration_date": "01/27"}
        response = self.client.post(self.url_create, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("number", response.data)

    def test_put_creditcard(self):
        data = {"number": self.credit_card_2.number, "card_alias": "Updated Card Alias"}
        self.client.force_authenticate(user=self.user)
        response = self.client.put(self.url_update, data, format="json")  # Usamos el número del payload
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.credit_card_2.refresh_from_db()
        self.assertEqual(self.credit_card_2.card_alias, "Updated Card Alias")

    """
    def test_put_creditcard_missing_number(self):
        data = {"card_alias": "New Alias"}
        response = self.client.put(self.url_update, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["detail"], "Card number is required.")

    def test_delete_creditcard(self):
        data = {"number": self.credit_card.number}  # Especificamos el número en el cuerpo de la solicitud
        response = self.client.delete(self.url_delete, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(CreditCard.objects.filter(number=self.credit_card.number).exists())

    def test_delete_creditcard_missing_number(self):
        response = self.client.delete(self.url_delete, {}, format="json")  # Sin el número en el cuerpo
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["detail"], "Card number is required.")
'
    """
