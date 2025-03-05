from django.db import models


class User(models.Model):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, unique=True)
    name = models.CharField(max_length=100)
    id_number = models.CharField(max_length=20, unique=True)
    credit_card_number = models.CharField(max_length=16, unique=True)

    def __str__(self):
        return self.email
