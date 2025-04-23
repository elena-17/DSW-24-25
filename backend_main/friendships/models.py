from django.db import models
from users.models import User


# Create your models here.
class Favorite(models.Model):
    class Meta:
        db_table = "favorites"
        constraints = [models.UniqueConstraint(fields=["user", "favorite_user"], name="unique_favorite")]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    favorite_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorite_by")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name} ➜ {self.favorite_user.name}"
