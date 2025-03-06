from django.test import TestCase

from register.models import User


class UserTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            email="test@example.com",
            phone_number="+1234567890",
            name="Test User",
            id_number="1234567890",
            credit_card_number="1234567890123456",
        )

    def test_user_creation(self):
        self.assertEqual(self.user.email, "test@example.com")
        self.assertEqual(self.user.phone_number, "+1234567890")
        self.assertEqual(self.user.name, "Test User")
        self.assertEqual(self.user.id_number, "1234567890")
        self.assertEqual(self.user.credit_card_number, "1234567890123456")
