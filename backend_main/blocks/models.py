from django.db import models
from users.models import User


class Block(models.Model):
    class Meta:
        db_table = "blocks"
        constraints = [models.UniqueConstraint(fields=["user", "blocked_user"], name="unique_block")]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocks")
    blocked_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocked_by")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name} 🚫 {self.blocked_user.name}"
