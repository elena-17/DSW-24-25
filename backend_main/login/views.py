from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import LoginSerializer


@api_view(["POST"])
def login_user(request):
    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
        # If the login serializer is valid, the user object is in the validated data
        user = serializer.validated_data["user"]
        return Response(
            {"message": "Login successful", "user_id": user.id, "email": user.email}, status=status.HTTP_200_OK
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
