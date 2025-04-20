from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework.exceptions import ValidationError as DRFValidationError

from transactions.models import Transaction


class TransactionStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["status"]

    def validate_status(self, value):
        if value not in ["approved", "rejected", "pending"]:
            raise serializers.ValidationError("Invalid status only 'approved', 'rejected' or 'pending' are allowed.")
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
            try:
                action()
            except DjangoValidationError as e:
                raise DRFValidationError({"amount": e.messages[0]})
        return instance
