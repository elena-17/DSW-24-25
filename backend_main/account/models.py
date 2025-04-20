from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models


class Account(models.Model):
    class Meta:
        db_table = "accounts"
        constraints = [models.CheckConstraint(check=models.Q(balance__gte=0), name="balance_non_negative")]

    user = models.OneToOneField("users.User", on_delete=models.CASCADE, related_name="account", primary_key=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.balance < 0:
            raise ValidationError("Account balance cannot be negative.")
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.user.id_number} - {self.balance}"
