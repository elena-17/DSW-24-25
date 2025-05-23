import re

from django.core.exceptions import ValidationError
from django.db import models
from users.models import User


def validate_expiration_date(value):
    if not re.match(r"^(0[1-9]|1[0-2])\/\d{2}$", value):  # MM/YY
        raise ValidationError("Incorrect expiration date format. Use MM/YY")


class CreditCard(models.Model):
    class Meta:
        db_table = "credit_cards"

    number = models.CharField(max_length=16, unique=True, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="credit_cards")
    owner_name = models.CharField(max_length=100, verbose_name="owner name")
    expiration_date = models.CharField(
        max_length=5, help_text="format: MM/YY", verbose_name="expiration date", validators=[validate_expiration_date]
    )
    card_alias = models.CharField(max_length=100, verbose_name="alias", blank=True, null=True)

    def __str__(self):
        return f"{self.number} - {self.owner_name}"
