from decimal import Decimal

from rest_framework import serializers

from creditcards.models import CreditCard


class CreditCardModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditCard
        fields = "__all__"


class CreditCardSerializer(serializers.Serializer):
    number = serializers.CharField(max_length=16)
    owner_name = serializers.CharField(max_length=100)
    expiration_date = serializers.DateField()
    cvv = serializers.CharField(max_length=3)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0.01"))

    def create(self, validated_data):
        return super().create(validated_data)
