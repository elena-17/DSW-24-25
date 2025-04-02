from rest_framework import serializers
from users.models import User

from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    sender = serializers.SlugRelatedField(queryset=User.objects.all(), slug_field="email")
    receiver = serializers.SlugRelatedField(queryset=User.objects.all(), slug_field="email")

    class Meta:
        model = Transaction
        fields = "__all__"
        extra_kwargs = {
            "sender": {"required": True},
            "receiver": {"required": True},
            "amount": {"required": True},
            "title": {"required": True},
        }
        read_only_fields = ["id", "created_at", "updated_at"]


class SendTransactionSerializer(serializers.Serializer):
    receivers = serializers.ListField(child=serializers.EmailField(), required=True, allow_empty=False)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    title = serializers.CharField(max_length=100, required=True)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)

    def validate_receivers(self, value):
        receivers = User.objects.filter(email__in=value)

        if len(receivers) != len(value):
            existing_emails = set(user.email for user in receivers)
            missing_emails = set(value) - existing_emails
            raise serializers.ValidationError({"receiver": f"Receivers do not exist: {', '.join(missing_emails)}"})
        return value

    def validate(self, data):
        # sender and receivers are already validated
        sender = self.context["request"].user
        receivers = User.objects.filter(email__in=data["receivers"])
        total_amount = data["amount"] * len(receivers)

        if sender.account.balance < total_amount:
            raise serializers.ValidationError({"amount": "Insufficient balance for this transaction."})

        data["sender"] = sender
        data["receivers"] = receivers
        if sender in receivers:
            raise serializers.ValidationError({"sender": "Sender and receiver cannot be the same."})
        return data

    def create(self, validated_data):
        transactions = []

        for receiver in validated_data["receivers"]:
            transaction = Transaction.objects.create(
                sender=validated_data["sender"],
                receiver=receiver,
                amount=validated_data["amount"],
                title=validated_data["title"],
                description=validated_data.get("description", ""),
                status="approved",  # By default, set to approved
                type="send",
            )
            transactions.append(transaction)

        return transactions


class RequestTransactionSerializer(serializers.Serializer):
    senders = serializers.ListField(child=serializers.EmailField(), required=True, allow_empty=False)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    title = serializers.CharField(max_length=100, required=True)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)

    def validate_senders(self, value):
        users = User.objects.filter(email__in=value)

        if len(users) != len(value):
            existing_emails = set(user.email for user in users)
            missing_emails = set(value) - existing_emails
            raise serializers.ValidationError({"senders": f"Users do not exist: {', '.join(missing_emails)}"})
        return value

    def validate(self, data):
        senders = User.objects.filter(email__in=data["senders"])
        receiver = self.context["request"].user

        data["senders"] = senders
        data["receiver"] = receiver
        if receiver in senders:
            raise serializers.ValidationError({"receiver": "Sender and receiver cannot be the same."})
        return data

    def create(self, validated_data):
        transactions = []

        for sender in validated_data["senders"]:
            transaction = Transaction.objects.create(
                sender=sender,
                receiver=validated_data["receiver"],
                amount=validated_data["amount"],
                title=validated_data["title"],
                description=validated_data.get("description", ""),
                type="request",
            )
            transactions.append(transaction)

        return transactions


class TransactionStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["status"]

    def validate_status(self, value):
        if value not in ["approved", "rejected"]:
            raise serializers.ValidationError("Invalid status only 'approved' or 'rejected'.")

        transaction = self.instance
        if transaction.status != "pending":
            raise serializers.ValidationError("Only pending transactions can be updated.")

        if value == "approved":
            if transaction.sender.account.balance < transaction.amount:
                raise serializers.ValidationError("Insufficient balance for this transaction.")
        return value

    def update(self, instance, validated_data):
        new_status = validated_data.get("status")

        if new_status == "approved":
            instance.approve()  # Usa el método en el modelo
        elif new_status == "rejected":
            instance.reject()

        return instance
