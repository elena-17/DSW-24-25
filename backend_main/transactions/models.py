from django.db import models
from users.models import User


class Transaction(models.Model):
    class Meta:
        db_table = "transactions"
        get_latest_by = "date"
        ordering = ["date"]

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions_sent")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions_received")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self) -> str:
        return f"{self.sender.id_number} -> {self.receiver.id_number} - {self.amount}"


class MoneyRequest(models.Model):
    class Meta:
        db_table = "requests"
        get_latest_by = "date_requested"
        ordering = ["date_requested"]

    request_from = models.ForeignKey(User, related_name="money_requests_sent", on_delete=models.CASCADE)
    request_to = models.ForeignKey(User, related_name="money_requests_received", on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date_requested = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=100)
    description = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    STATUS_CHOICES = [("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")

    def approve(self):
        """when the request is approved, a transaction is created and the status is updated"""
        Transaction.objects.create(
            sender=self.request_to,
            receiver=self.request_from,
            amount=self.amount,
            title=self.title,
            description=self.description,
        )
        self.status = "approved"
        self.save()

    def __str__(self) -> str:
        return f"{self.request_from.id_number} -> {self.request_to.id_number} - {self.amount}"
