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

    def validate(self, data):
        # if len(data['number']) != 16:
        #     raise serializers.ValidationError("Credit card number must have 16 digits.")
        if len(data["cvv"]) != 3:
            raise serializers.ValidationError("CVV must have 3 digits.")
        return data

    def create(self, validated_data):
        return super().create(validated_data)
