from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from users.serializers.register import RegisterSerializer
from users.serializers.token import CustomTokenObtainPairSerializer
from users.serializers.user import UserProfileSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request) -> Response:
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_user_profile(request):
    user = request.user
    serializer = UserProfileSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["PUT"])
def update_user_profile(request):
    user = request.user
    print("Usuario autenticado:", user)  # Verificar usuario autenticado
    print("Datos recibidos:", request.data)  # Verificar datos entrantes
    
    serializer = UserProfileSerializer(user, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        user.refresh_from_db()
        print("Usuario después de actualizar:", user.name, user.phone)  # Verificar si se actualizó
        
        return Response(serializer.data, status=status.HTTP_200_OK)

    print("Errores de validación:", serializer.errors)  # Verificar errores en el serializador
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
def delete_user_account(request):
    """Elimina la cuenta del usuario autenticado"""
    user = request.user
    user.delete()
    return Response({"message": "Account deleted"}, status=status.HTTP_204_NO_CONTENT)
