from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        if not user.is_confirmed:
            raise AuthenticationFailed("User is not confirmed. Please confirm your email before logging in.")

        token = super().get_token(user)
        # Add extra info to token
        token["name"] = user.name
        token["role"] = user.role
        token["email"] = user.email
        return token
