from django.contrib.auth.hashers import check_password
from register.models import User
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    email_or_id_number = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        email_or_id_number = data.get("email_or_id_number")
        password = data.get("password")

        # Check if the user exists with the provided email or ID number
        user = (
            User.objects.filter(email=email_or_id_number).first()
            or User.objects.filter(id_number=email_or_id_number).first()
        )

        if user is None:
            raise serializers.ValidationError("User with provided email or ID number does not exist.")

        # Verify the password
        if not check_password(password, user.password):
            raise serializers.ValidationError("Invalid password.")

        # Give the user object to the view
        return {"user": user}
