from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import LimitOffsetPagination
from ..serializers import FavoriteSerializer
from users.models import User
from ..models import Favorite


# Create your views here.
# Get all favorite pairs
@api_view(["GET"])
def get_all_favorite_pairs(request):
    favorites = Favorite.objects.select_related("user", "favorite_user").all().order_by("id")
    paginator = LimitOffsetPagination()
    paginated_qs = paginator.paginate_queryset(favorites, request)
    serializer = FavoriteSerializer(paginated_qs, many=True)
    return Response({
        "data": serializer.data,
        "total": paginator.count
    }, status=status.HTTP_200_OK)

# Manually add a favorite relation between two users
@api_view(["POST"])
def admin_add_favorite_relation(request):
    user_email = request.data.get("user")
    favorite_email = request.data.get("favorite_user")

    if not user_email or not favorite_email:
        return Response({"error": "Both 'user' and 'favorite_user' emails are required."}, status=status.HTTP_400_BAD_REQUEST)

    if user_email == favorite_email:
        return Response({"error": "A user cannot favorite themselves."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=user_email)
        favorite_user = User.objects.get(email=favorite_email)

        # Verificar si ya existe la relación
        if Favorite.objects.filter(user=user, favorite_user=favorite_user).exists():
            return Response(
                {"error": "This favorite relation already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Si no existe, se crea
        favorite = Favorite.objects.create(user=user, favorite_user=favorite_user)
        FavoriteSerializer(favorite)
        return Response({"message": f"Relation added: {user_email} ➜ {favorite_email}"}, status=status.HTTP_201_CREATED)
    except User.DoesNotExist:
        return Response({"error": "One or both users not found."}, status=status.HTTP_404_NOT_FOUND)

# Manually remove a favorite relation between two users
@api_view(["DELETE"])
def admin_remove_favorite_relation(request):
    user_email = request.data.get("user")
    favorite_email = request.data.get("favorite_user")

    if not user_email or not favorite_email:
        return Response({"error": "Both 'user' and 'favorite_user' emails are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=user_email)
        favorite_user = User.objects.get(email=favorite_email)
        fav = Favorite.objects.get(user=user, favorite_user=favorite_user)
        FavoriteSerializer(fav)  # Serializamos antes de borrar
        fav.delete()
        return Response({"message": f"Relation removed: {user_email} ➜ {favorite_email}"}, status=status.HTTP_200_OK)
    except (User.DoesNotExist, Favorite.DoesNotExist):
        return Response({"error": "Favorite relation not found."}, status=status.HTTP_404_NOT_FOUND)