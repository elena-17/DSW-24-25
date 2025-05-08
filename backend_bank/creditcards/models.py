import re

from django.db import models
from django.forms import ValidationError


def validate_expiration_date(value):
    if not re.fullmatch(r"^(0[1-9]|1[0-2])\/\d{2}$", value):  # MM/YY
        raise ValidationError("Incorrect expiration date format. Use MM/YY")


class CreditCard(models.Model):
    number = models.CharField(max_length=16, unique=True, primary_key=True)
    owner_name = models.CharField(max_length=100, verbose_name="owner name")
    expiration_date = models.CharField(
        max_length=5, help_text="format: MM/YY", verbose_name="expiration date", validators=[validate_expiration_date]
    )
    cvv = models.CharField(max_length=3)

    def __str__(self) -> str:
        return f"{self.number} - {self.owner_name}"
