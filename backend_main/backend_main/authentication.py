# tu_app/authentication.py
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from users.models import User


class CustomTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None  # no auth header

        try:
            prefix, token = auth_header.split(" ")
        except ValueError:
            raise AuthenticationFailed("Authorization header invalid.")

        if prefix.lower() != "token":
            return None

        try:
            # Search for the user with the token
            user = User.objects.get(token=token)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid token.")

        return (user, None)
