from rest_framework import serializers

from .models import CreditCard


class CreditCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditCard
        fields = ["number", "owner_name", "expiration_date", "card_alias"]
