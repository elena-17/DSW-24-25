from decimal import Decimal, InvalidOperation

from rest_framework import serializers


class CreditCardSerializer(serializers.Serializer):
    number = serializers.CharField(max_length=16)
    owner_name = serializers.CharField(max_length=100)
    expiration_date = serializers.CharField(max_length=5)
    cvv = serializers.CharField(max_length=3)
    amount = serializers.CharField()

    def validate_cvv(self, value):
        if not value.isdigit() or len(value) != 3:
            raise serializers.ValidationError("CVV must be a 3-digit number.")
        return value

    def validate_expiration_date(self, value):
        import re

        if not re.fullmatch(r"^(0[1-9]|1[0-2])\/\d{2}$", value):
            raise serializers.ValidationError("Incorrect expiration date format. Use MM/YY")
        return value

    def validate_amount(self, value):
        try:
            amount = Decimal(value)
            if amount < Decimal("0.01"):
                raise serializers.ValidationError("Amount must be at least 0.01")
            return amount
        except (ValueError, TypeError, InvalidOperation):
            raise serializers.ValidationError("Amount must be a valid decimal number.")
