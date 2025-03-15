from django.core.exceptions import ValidationError
from django.db import models
from register.models import User


# Create your models here.
class Friendship(models.Model):
    class Meta:
        db_table = "friendships"
        constraints = [models.UniqueConstraint(fields=["user1", "user2"], name="unique_friendship")]

    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendship_user1")
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendship_user2")

    def save(self, *args, **kwargs):
        # Asegurarse de que siempre guardamos la relación de menor a mayor, MISMO ORDEN
        if self.user1.id_number > self.user2.id_number:
            self.user1, self.user2 = self.user2, self.user1

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user1.name} - {self.user2.name}"


class FriendRequest(models.Model):
    class Meta:
        db_table = "friend_requests"
        constraints = [
            models.UniqueConstraint(
                fields=["sender", "receiver"], name="unique_friend_request", condition=models.Q(status="pending")
            )
        ]

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_requests")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_requests")

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("denied", "Denied"),
    ]

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self) -> None:
        if FriendRequest.objects.filter(
            (models.Q(sender=self.sender) & models.Q(receiver=self.receiver))
            | (models.Q(sender=self.receiver) & models.Q(receiver=self.sender)),
            status="pending",
        ).exists():
            raise ValidationError("A pending friend request already exists between these users.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.sender.name} → {self.receiver.name} ({self.status})"
