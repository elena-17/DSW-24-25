from django.core.exceptions import ValidationError
from django.db import models
from users.models import User


class Transaction(models.Model):
    class Meta:
        db_table = "transactions"
        get_latest_by = "created_at"
        ordering = ["-created_at"]  # newest first

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions_sent")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions_received")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    updated_at = models.DateTimeField(auto_now=True)

    def approve(self):

        if self.sender.account.balance < self.amount:
            raise ValidationError("Insuficient balance for this transaction.")

        # Actualizar los saldos
        self.sender.account.balance -= self.amount
        self.sender.account.save()

        self.receiver.account.balance += self.amount
        self.receiver.account.save()

        self.status = "approved"
        self.save()

    def reject(self):

        self.status = "rejected"
        self.save()

    def __str__(self) -> str:
        return f"{self.sender.id_number} -> {self.receiver.id_number} - {self.amount} - {self.status}"
