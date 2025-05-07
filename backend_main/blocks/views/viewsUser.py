from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from users.models import User
from users.serializers.user import UserProfileSerializer

from ..models import Block
from ..serializers import BlockSerializer


# GET: Returns users blocked by the current user
@api_view(["GET"])
def get_blocked_users(request):
    current_user = request.user
    blocked_users = User.objects.filter(blocked_by__user=current_user).order_by("email")
    serializer = UserProfileSerializer(blocked_users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# GET: Returns users not blocked by current user (excluding self/admins)
@api_view(["GET"])
def get_non_blocked_users(request):
    current_user = request.user
    non_blocked_users = User.objects.exclude(
        Q(blocked_by__user=current_user)
        | Q(email=current_user.email)
        | Q(role__iexact="admin")
        | Q(role__iexact="seller")
        | Q(is_superuser=True)
    ).order_by("name")
    serializer = UserProfileSerializer(non_blocked_users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# POST: Block a user
@api_view(["POST"])
def block_user(request):
    current_user = request.user
    blocked_email = request.data.get("email")

    if not blocked_email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    if blocked_email == current_user.email:
        return Response({"error": "Cannot block yourself"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        blocked_user = User.objects.get(email=blocked_email)
        BlockSerializer(Block.objects.get_or_create(user=current_user, blocked_user=blocked_user))
        return Response({"message": "User has been blocked"}, status=status.HTTP_201_CREATED)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


# DELETE: Unblock a user
@api_view(["DELETE"])
def unblock_user(request):
    current_user = request.user
    blocked_email = request.data.get("email")

    if not blocked_email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        blocked_user = User.objects.get(email=blocked_email)
        block_entry = Block.objects.get(user=current_user, blocked_user=blocked_user)
        BlockSerializer(block_entry)
        block_entry.delete()
        return Response({"message": "User has been unblocked"}, status=status.HTTP_200_OK)
    except (User.DoesNotExist, Block.DoesNotExist):
        return Response({"error": "Blocked user not found"}, status=status.HTTP_404_NOT_FOUND)
