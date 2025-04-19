from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User

from transactions.models import Transaction


class TransactionAPI(APITestCase):
    def setUp(self) -> None:
        # Create test users
        self.password = "password123"
        self.user1 = User.objects.create_user(
            email="user1@test.com",
            phone="123456789",
            name="User One",
            id_number="111111111",
            password=self.password,
            is_confirmed=True,
        )
        self.user2 = User.objects.create_user(
            email="user2@test.com",
            phone="987654321",
            name="User Two",
            id_number="222222222",
            password=self.password,
            is_confirmed=True,
        )

        # Add money to user accounts
        self.user1.account.balance = 1000
        self.user1.account.save()
        self.user2.account.balance = 1000
        self.user2.account.save()

        self.token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def get_token(self):
        data = {"email": self.user1.email, "password": self.password}
        response = self.client.post(reverse("user:login_user"), data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["access"]

    # def test_get_transaction_successful(self) -> None:
    #     # Send GET request to retrieve the transaction
    #     self.transaction = Transaction.objects.create(
    #         sender=self.user1,
    #         receiver=self.user2,
    #         amount=150,
    #         title="Sample Transaction",
    #         description="This is a test transaction",
    #         status="pending",
    #         type="send",
    #     )

    #     transaction_url = reverse("get_transaction", kwargs={"id": self.transaction.id})
    #     response = self.client.get(transaction_url)

    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertEqual(response.data["id"], self.transaction.id)
    #     self.assertEqual(response.data["sender"], self.user1.email)
    #     self.assertEqual(response.data["receiver"], self.user2.email)
    #     self.assertEqual(response.data["amount"], "150.00")
    #     self.assertEqual(response.data["title"], "Sample Transaction")
    #     self.assertEqual(response.data["description"], "This is a test transaction")
    #     self.assertEqual(response.data["status"], "pending")
    #     self.assertEqual(response.data["type"], "send")
    @patch("transactions.views.viewsUser.publish_to_mercure")
    def test_send_money(self, mock_mercure):
        send_money_url = reverse("send_money")

        payload = {
            "receivers": [self.user2.email],
            "amount": 50,
            "title": "Payment",
            "description": "Payment for services",
        }
        response = self.client.post(send_money_url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        data = response.data
        self.assertIn("transactions", data)
        self.assertEqual(len(data["transactions"]), 1)

        transaction = Transaction.objects.get(id=data["transactions"][0]["id"])
        self.assertEqual(transaction.sender, self.user1)
        self.assertEqual(transaction.receiver, self.user2)
        self.assertEqual(transaction.amount, 50)
        self.assertEqual(transaction.title, "Payment")
        self.assertEqual(transaction.description, "Payment for services")
        # self.assertEqual(transaction.status, "approved")
        self.assertEqual(transaction.status, "pending")
        self.assertEqual(transaction.type, "send")

        self.assertEqual(data["transactions"][0]["id"], transaction.id)
        self.user1.account.refresh_from_db()
        self.assertEqual(str(self.user1.account.balance), "950.00")

    @patch("transactions.views.viewsUser.publish_to_mercure")
    def test_send_money_same_user(self, mock_mercure):
        send_money_url = reverse("send_money")

        payload = {
            "receivers": [self.user1.email],
            "amount": 50,
            "title": "Payment",
            "description": "Payment for services",
        }
        response = self.client.post(send_money_url, data=payload, format="json")

        # Verify the response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("sender", response.data)
        self.assertEqual(response.data["sender"], ["Sender and receiver cannot be the same."])

    @patch("transactions.views.viewsUser.publish_to_mercure")
    def test_request_money(self, mock_mercure):
        request_money_url = reverse("request_money")

        payload = {
            "senders": [self.user2.email],
            "amount": 50,
            "title": "Payment",
            "description": "Payment for services",
        }
        response = self.client.post(request_money_url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        data = response.data
        self.assertIn("transactions", data)
        self.assertEqual(len(data["transactions"]), 1)

        transaction = Transaction.objects.get(id=data["transactions"][0]["id"])
        self.assertEqual(transaction.sender, self.user2)
        self.assertEqual(transaction.receiver, self.user1)
        self.assertEqual(transaction.amount, 50)
        self.assertEqual(transaction.title, "Payment")
        self.assertEqual(transaction.description, "Payment for services")
        self.assertEqual(transaction.status, "pending")
        self.assertEqual(transaction.type, "request")

        self.assertEqual(data["transactions"][0]["id"], transaction.id)
        self.assertEqual(str(self.user2.account.balance), "1000")

    def test_update_send_transaction_approved(self):
        # Create a transaction for testing
        self.transaction = Transaction.objects.create(
            sender=self.user1,
            receiver=self.user2,
            amount=100,
            title="Sample Transaction",
            description="This is a test transaction",
            status="pending",
            type="send",
        )

        update_url = reverse("update_transaction_status", kwargs={"id": self.transaction.id})
        payload = {"status": "approved"}
        response = self.client.put(update_url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.transaction.refresh_from_db()
        self.assertEqual(self.transaction.status, "approved")
        self.assertEqual(str(self.transaction.receiver.account.balance), "1100.00")

    def test_update_send_transaction_rejected(self):
        self.transaction = Transaction.objects.create(
            sender=self.user1,
            receiver=self.user2,
            amount=100,
            title="Sample Transaction",
            description="This is a test transaction",
            status="pending",
            type="send",
        )

        update_url = reverse("update_transaction_status", kwargs={"id": self.transaction.id})
        payload = {"status": "rejected"}
        response = self.client.put(update_url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.transaction.refresh_from_db()
        self.assertEqual(self.transaction.status, "rejected")
        self.assertEqual(str(self.transaction.sender.account.balance), "1100.00")
        self.assertEqual(str(self.transaction.receiver.account.balance), "1000.00")

    def test_update_request_transaction_approved(self):
        self.transaction = Transaction.objects.create(
            sender=self.user1,
            receiver=self.user2,
            amount=100,
            title="Sample Transaction",
            description="This is a test transaction",
            status="pending",
            type="request",
        )

        update_url = reverse("update_transaction_status", kwargs={"id": self.transaction.id})
        payload = {"status": "approved"}
        response = self.client.put(update_url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.transaction.refresh_from_db()
        self.assertEqual(self.transaction.status, "approved")
        self.assertEqual(str(self.transaction.receiver.account.balance), "1100.00")

    def test_update_request_transaction_rejected(self):
        self.transaction = Transaction.objects.create(
            sender=self.user1,
            receiver=self.user2,
            amount=100,
            title="Sample Transaction",
            description="This is a test transaction",
            status="pending",
            type="request",
        )

        update_url = reverse("update_transaction_status", kwargs={"id": self.transaction.id})
        payload = {"status": "rejected"}
        response = self.client.put(update_url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.transaction.refresh_from_db()
        self.assertEqual(self.transaction.status, "rejected")
        self.assertEqual(str(self.transaction.receiver.account.balance), "1000.00")
