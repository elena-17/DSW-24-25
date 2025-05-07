from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from users.models import User
from users.serializers.bulkDelete import BulkDeleteSerializer
from users.serializers.register import RegisterSerializer
from users.serializers.token import CustomTokenObtainPairSerializer
from users.serializers.user import UserProfileSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet is for administration of users.
    Provides CRUD operations and additional actions for users.
    """

    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["delete"], url_path="bulk-delete")
    def bulk_delete(self, request):
        serializer = BulkDeleteSerializer(data=request.data)
        if serializer.is_valid():
            emails = serializer.validated_data["emails"]
            users = User.objects.filter(email__in=emails)
            count = users.delete()[0]
            return Response({"message": f"Successfully deleted {count} users."}, status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["delete"], url_path="delete/(?P<email>.+)")
    def delete_by_email(self, request, email=None):
        user = get_object_or_404(User, email=email)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # @action(detail=False, methods=["get"], url_path="get/(?P<email>.+)")
    # def get_user_by_email(self, request, email=None):
    #    user = get_object_or_404(User, email=email)
    #    serializer = UserProfileSerializer(user)
    #    return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["put"], url_path="update/(?P<email>.+)")
    def update_by_email(self, request, email=None):
        user = get_object_or_404(User, email=email)
        password = request.data.get("password", None)
        serializer = UserProfileSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            if password:
                user.set_password(password)
                user.save()
            user.refresh_from_db()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def register_user_admin(request):
    """
    Register a new user.
    """
    if request.user.role != "admin":
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.is_confirmed = True
        user.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
