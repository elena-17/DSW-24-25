from django.test import TestCase

from users.models import User


class UserTestCase(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create(
            email="test@example.com",
            phone_number="+1234567890",
            name="Test User",
            id_number="12345678X",
            rol=0,
            password="securepassword123",
        )

    def test_user_creation(self) -> None:
        self.assertEqual(self.user.email, "test@example.com")
        self.assertEqual(self.user.phone_number, "+1234567890")
        self.assertEqual(self.user.name, "Test User")
        self.assertEqual(self.user.id_number, "12345678X")
        self.assertEqual(self.user.rol, 0)
