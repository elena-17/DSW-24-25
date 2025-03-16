from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import UserProfileSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Obtain the profile data of the authenticated user.
    """
    serializer = UserProfileSerializer()(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update the profile data of the authenticated user.
    """
    user = request.user
    serializer = UserProfileSerializer()(user, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user_account(request):
    """
    Eliminate the account of the authenticated user.
    """
    user = request.user
    user.delete()
    return Response({"message": "Account deleted successfully"}, status=status.HTTP_200_OK)
