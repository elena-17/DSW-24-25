from rest_framework import serializers

from transactions.models import Transaction


class TransactionStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["status"]

    def validate_status(self, value):
        if value not in ["approved", "rejected", "pending"]:
            raise serializers.ValidationError("Invalid status only 'approved', 'rejected' or 'pending' are allowed.")

        transaction = self.instance
        if value == "approved":
            if transaction.sender.account.balance < transaction.amount:
                raise serializers.ValidationError("Insufficient balance for this transaction.")
        if value == "rejected":
            if transaction.status == "approved" and transaction.receiver.account.balance < transaction.amount:
                raise serializers.ValidationError("Insufficient balance for this transaction.")
        return value

    def update(self, instance, validated_data):
        new_status = validated_data.get("status")

        action_map = {
            ("approved", "send"): instance.approveSend,
            ("approved", "request"): instance.approveRequest,
            ("rejected", "send"): instance.rejectSend,
            ("rejected", "request"): instance.rejectRequest,
            ("pending", "send"): instance.pendingSend,
            ("pending", "request"): instance.pendingRequest,
        }

        action = action_map.get((new_status, instance.type))
        if action:
            action()

        return instance
