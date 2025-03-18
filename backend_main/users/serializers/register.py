from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from users.models import USER_ROLES, User


class RegisterSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15, validators=[UniqueValidator(queryset=User.objects.all())])
    name = serializers.CharField(max_length=100)
    id_number = serializers.CharField(
        required=True, max_length=20, validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(write_only=True, required=True, style={"input_type": "password"})
    email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=User.objects.all())])
    role = serializers.ChoiceField(choices=USER_ROLES)

    class Meta:
        model = User
        fields = ["id_number", "email", "phone", "name", "role", "password"]
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def validate_role(self, value):
        valid_roles = ["user", "seller", "admin"]
        if value not in valid_roles:
            raise serializers.ValidationError(f"Invalid role. Choose from: {valid_roles}")
        return value

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        return User.objects.create(**validated_data)
