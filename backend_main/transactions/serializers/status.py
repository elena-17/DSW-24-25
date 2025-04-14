from rest_framework import serializers

from transactions.models import Transaction


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

        if new_status == "approved" and instance.type == "send":
            instance.approveSend()
        elif new_status == "approved" and instance.type == "request":
            instance.approveRequest()
        elif new_status == "rejected" and instance.type == "send":
            instance.rejectSend()
        elif new_status == "rejected" and instance.type == "request":
            instance.rejectRequest()

        return instance
