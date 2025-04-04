from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from users.models import User
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
        invitation_link = generate_invitation_link(serializer.validated_data['email'])
        print(f"Invitation link: {invitation_link}")
        # Crear el cuerpo del correo
        subject = 'Invitación para completar tu registro'
        message = f'''
        <html>
        <body>
            <p>Has sido invitado a completar tu registro. Para hacerlo, haz clic en el siguiente enlace:</p>
            <a href="{invitation_link}" style="background-color:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Aceptar Invitación</a>
            <p>Si no esperabas esta invitación, por favor ignora este correo.</p>
        </body>
        </html>
        '''
        # Enviar el correo electrónico
        # Enviar el correo
        send_mail(
            subject,
            '',
            settings.DEFAULT_FROM_EMAIL,
            [serializer.validated_data['email']],
            html_message=message
        )

        return Response({"message": "User registered successfully, invitation email sent!"}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def generate_invitation_link(email: str) -> str:
    # Aquí puedes generar el enlace de invitación con un token, por ejemplo:
    token = urlsafe_base64_encode(email.encode())  # Este es solo un ejemplo, puedes usar un token más seguro
    invitation_link = f'http://localhost:4200/confirm-register/?email={email}&token={token}'
    return invitation_link

@api_view(["GET"])
def confirm_user_registration(request):
    email = request.data.get("email")
    user = User.objects.filter(email=email).first()

    if user:
        user.is_confirmed = True
        user.save()
        return Response({"message": "User confirmed successfully."}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid confirmation link."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def get_user_profile(request):
    user = request.user
    serializer = UserProfileSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["PUT"])
def update_user_profile(request):
    user = request.user
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
def change_user_password(request):
    user = request.user
    current_password = request.data.get("currentPassword")
    new_password = request.data.get("password")

    if not current_password or not new_password:
        return Response({"error": "Both current and new passwords are required."}, status=status.HTTP_400_BAD_REQUEST)

    # Verificate current password is correct
    if not user.check_password(current_password):
        return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

    # Change password and save
    user.set_password(new_password)
    user.save()

    return Response({"message": "Password changed successfully!"}, status=status.HTTP_200_OK)


@api_view(["DELETE"])
def delete_user_account(request):
    user = request.user
    user.delete()
    return Response({"message": "Account deleted"}, status=status.HTTP_204_NO_CONTENT)
