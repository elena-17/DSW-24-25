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
    rol = serializers.IntegerField(default=0)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("The email is already in use.")
        return value

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("The number is already in use.")
        return value

    def validate_id_number(self, value):
        if User.objects.filter(id_number=value).exists():
            raise serializers.ValidationError("The ID number is already in use.")
        return value

    def create(self, validated_data):
        return User.objects.create(**validated_data)
