import re

from django.core.exceptions import ValidationError
from django.db import models
from encrypted_model_fields.fields import EncryptedCharField
from register.models import User


def validate_expiration_date(value):
    if not re.match(r"^(0[1-9]|1[0-2])\/\d{2}$", value):  # MM/YY
        raise ValidationError("Incorrect expiration date format. Use MM/YY")


# Create your models here.
class CreditCard(models.Model):
    class Meta:
        db_table = "credit_cards"
        constraints = [models.UniqueConstraint(fields=["user", "is_default"], name="unique_default_card")]

    number = EncryptedCharField(max_length=16, unique=True, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="credit_cards")
    owner_name = models.CharField(max_length=100, verbose_name="owner name")
    expiration_date = models.CharField(
        max_length=5, help_text="format: MM/YY", verbose_name="expiration date", validators=[validate_expiration_date]
    )
    cvv = EncryptedCharField(max_length=3)
    card_alias = models.CharField(max_length=100, verbose_name="alias", blank=True, null=True)
    is_default = models.BooleanField(default=False)  # optional, for the frontend to preselect a card

    def __str__(self):
        return f"{self.number} - {self.owner_name}"
