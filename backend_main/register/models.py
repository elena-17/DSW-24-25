from django.contrib.auth.hashers import make_password
from django.db import models


class User(models.Model):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, unique=True)
    name = models.CharField(max_length=100)
    id_number = models.CharField(max_length=20, unique=True)
    rol = models.IntegerField(default=0)  # 0: User, 1: Admin
    password = models.CharField(max_length=128, null=True, blank=True, default="")

    class Meta:
        db_table = "users"

    def save(self, *args, **kwargs):
        # Password hashing if it's not already hashed
        if not self.password.startswith("pbkdf2_sha256$"):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email
