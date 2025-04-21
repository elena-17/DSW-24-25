from django.db.models import BooleanField, ExpressionWrapper, Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from users.models import User
from users.serializers.user import UserProfileSerializer

from .models import Favorite


# Create your views here.
# This function retrieves all users who are marked as favorites by the current user.
@api_view(["GET"])
def get_favorite_users(request):
    current_user = request.user
    favorite_users = User.objects.filter(favorite_by__user=current_user).order_by("name")
    serializer = UserProfileSerializer(favorite_users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# This function retrieves all users who are not marked as favorites by the current user and avoid current user.
@api_view(["GET"])
def get_non_favorite_users(request):
    current_user = request.user
    non_favorite_users = User.objects.exclude(
        Q(favorite_by__user=current_user) | Q(email=current_user.email) | Q(is_admin=True)
    ).order_by("name")
    serializer = UserProfileSerializer(non_favorite_users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# This function allows the current user to add a user to their favorites.
@api_view(["POST"])
def add_to_favorites(request):
    current_user = request.user
    favorite_email = request.data.get("email")

    if not favorite_email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    if favorite_email == current_user.email:
        return Response({"error": "Cannot favorite yourself"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        favorite_user = User.objects.get(email=favorite_email)
        Favorite.objects.get_or_create(user=current_user, favorite_user=favorite_user)
        return Response({"message": "User added to favorites"}, status=status.HTTP_201_CREATED)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


# This function allows the current user to remove a user from their favorites.
@api_view(["DELETE"])
def remove_from_favorites(request):
    current_user = request.user
    favorite_email = request.data.get("email")

    if not favorite_email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        favorite_user = User.objects.get(email=favorite_email)
        favorite_entry = Favorite.objects.get(user=current_user, favorite_user=favorite_user)
        favorite_entry.delete()
        return Response({"message": "User removed from favorites"}, status=status.HTTP_200_OK)
    except (User.DoesNotExist, Favorite.DoesNotExist):
        return Response({"error": "Favorite user not found"}, status=status.HTTP_404_NOT_FOUND)
