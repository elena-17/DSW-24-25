from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=15)
    name = serializers.CharField(max_length=100)
    id_number = serializers.CharField(max_length=20)
    credit_card = serializers.IntegerField(required=False)
    rol = serializers.IntegerField(default=0)  
    
    def create(self, validated_data):
        validated_data["credit_card_number"] = validated_data.pop("credit_card", None)
        return User.objects.create(**validated_data)

