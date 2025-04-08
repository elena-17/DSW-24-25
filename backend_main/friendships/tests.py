from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.test import TestCase
from users.models import User

from .models import FriendRequest, Friendship


class FriendshipTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        """Executed once for all tests of the class."""
        cls.user1 = User.objects.create(
            email="user@test.com",
            phone="123456789",
            name="Test User",
            id_number="123456789",
            password="testpassword",
            is_confirmed=True,
        )
        cls.user2 = User.objects.create(
            email="user2@test.com",
            phone="987654321",
            name="Test User2",
            id_number="987654321",
            password="testpassword",
            is_confirmed=True,
        )

    def test_friendship_creation(self) -> None:
        friendship = Friendship.objects.create(user1=self.user1, user2=self.user2)

        self.assertEqual(friendship.user1, self.user1)
        self.assertEqual(friendship.user2, self.user2)

    def test_duplicate_friendship(self) -> None:
        # friendship user1 with user2
        Friendship.objects.create(user1=self.user1, user2=self.user2)

        # try make friendship user2 with user1
        with self.assertRaises(IntegrityError):
            Friendship.objects.create(user1=self.user1, user2=self.user2)


class FriendRequestTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        """Executed once for all tests of the class."""
        cls.user1 = User.objects.create(
            email="user@test.com",
            phone="123456789",
            name="Test User",
            id_number="123456789",
            password="testpassword",
            is_confirmed=True,
        )
        cls.user2 = User.objects.create(
            email="user2@test.com",
            phone="987654321",
            name="Test User2",
            id_number="987654321",
            password="testpassword",
            is_confirmed=True,
        )

    def test_friend_request_creation(self) -> None:
        friend_request = FriendRequest.objects.create(sender=self.user1, receiver=self.user2)

        self.assertEqual(friend_request.sender, self.user1)
        self.assertEqual(friend_request.receiver, self.user2)
        self.assertEqual(friend_request.status, "pending")

    def test_duplicate_friend_request_pending(self) -> None:
        # friend request from user1 to user2
        FriendRequest.objects.create(sender=self.user1, receiver=self.user2)

        # try to make the same request again
        with self.assertRaises(ValidationError):
            FriendRequest.objects.create(sender=self.user1, receiver=self.user2)

    def test_duplicate_friend_request_accepted(self) -> None:
        # friend request from user1 to user2
        FriendRequest.objects.create(sender=self.user1, receiver=self.user2, status="accepted")

        # try to make new request
        FriendRequest.objects.create(sender=self.user1, receiver=self.user2)

    def test_duplicate_friend_request_interchanged(self) -> None:
        # friend request from user1 to user2
        FriendRequest.objects.create(sender=self.user1, receiver=self.user2)

        # try to make a request user2 to user1
        with self.assertRaises(Exception):
            FriendRequest.objects.create(sender=self.user2, receiver=self.user1)
