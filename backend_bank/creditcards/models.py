from django.db import models


class CreditCard(models.Model):
    number = models.CharField(max_length=16, unique=True)
    owner_name = models.CharField(max_length=100, verbose_name="owner name")
    expiration_date = models.DateField(verbose_name="expiration date")
    cvv = models.CharField(max_length=3)

    def __str__(self):
        return self.number
