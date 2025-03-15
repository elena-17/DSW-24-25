from decimal import Decimal
from django.db import models

from register.models import User

# Create your models here.
class Account(models.Model):
    class Meta:
        db_table = "accounts"
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="account", primary_key=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    updated_at = models.DateTimeField(auto_now=True)

    def deposit(self, amount) -> None:
        self.balance += amount
        self.save()

    def withdraw(self, amount) -> bool:
        if self.balance >= amount:
            self.balance -= amount
            self.save()
            return True
        return False
    
    def __str__(self) -> str:
        return f"{self.user.id_number} - {self.balance}"