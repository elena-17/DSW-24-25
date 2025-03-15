from django import db
from django.db import models

from register.models import User
# Create your models here.
class Friendship(models.Model):
    class Meta:
        db_table = "friendships"
        constraints = [
            models.UniqueConstraint(fields=['user1', 'user2'], name='unique_friendship')
        ]

    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendship_user1")
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendship_user2")

    def __str__(self):
        return f"{self.user1.name} - {self.user2.name}"
    


class FriendRequest(models.Model):
    class Meta:
        db_table = "friend_requests"
        constraints = [
            models.UniqueConstraint(fields=['sender', 'receiver'], name='unique_friend_request',condition=models.Q(status='pending'))
        ]

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_requests")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_requests")
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('denied', 'Denied'),
    ]
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)



    def __str__(self):
        return f"{self.sender.name} → {self.receiver.name} ({self.status})"