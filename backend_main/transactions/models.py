from django.db import models
from users.models import User


class Transaction(models.Model):
    class Meta:
        db_table = "transactions"
        get_latest_by = "created_at"
        ordering = ["-created_at"]  # newest first
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["created_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=~models.Q(sender=models.F("receiver")),
                name="sender_receiver_different",
            ),
        ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("processing", "Processing"),
    ]

    TYPE_CHOICES = [
        ("send", "Send"),
        ("request", "Request"),
    ]

    # sender = always the user who sends the money
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions_sent")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions_received")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    updated_at = models.DateTimeField(auto_now=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default="send")
    confirmation_code = models.CharField(max_length=6, null=True, blank=True)
    confirmation_token = models.CharField(max_length=64, null=True, blank=True)

    def approveSend(self):
        if self.status == "rejected":
            self.sender.account.balance -= self.amount
            self.sender.account.save()

        self.receiver.account.balance += self.amount
        self.receiver.account.save()

        self.status = "approved"
        self.save()

    def rejectSend(self):
        if self.status == "approved":
            self.receiver.account.balance -= self.amount
            self.receiver.account.save()

        self.sender.account.balance += self.amount
        self.sender.account.save()
        self.status = "rejected"
        self.save()

    def approveRequest(self):
        self.sender.account.balance -= self.amount
        self.sender.account.save()

        self.receiver.account.balance += self.amount
        self.receiver.account.save()

        self.status = "approved"
        self.save()

    def rejectRequest(self):
        if self.status == "approved":
            self.receiver.account.balance -= self.amount
            self.receiver.account.save()
            self.sender.account.balance += self.amount
            self.sender.account.save()

        self.status = "rejected"
        self.save()

    def pendingSend(self):
        if self.status == "approved":
            self.receiver.account.balance -= self.amount
            self.receiver.account.save()
        if self.status == "rejected":
            self.sender.account.balance -= self.amount
            self.sender.account.save()
        self.status = "pending"
        self.save()

    def pendingRequest(self):
        if self.status == "approved":
            self.receiver.account.balance -= self.amount
            self.receiver.account.save()

            self.sender.account.balance += self.amount
            self.sender.account.save()

        self.status = "pending"
        self.save()

    def __str__(self) -> str:
        return f"{self.sender.id_number} -> {self.receiver.id_number} - {self.amount} - {self.status}"
