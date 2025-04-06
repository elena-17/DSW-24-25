import threading

from email.utils import quote

from django.conf import settings
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from users.models import User
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
        email = serializer.validated_data["email"]
        invitation_link = generate_invitation_link(email)
        threading.Thread(target=send_invitation_email, args=(email, invitation_link)).start()

        return Response(
            {"message": "User registered successfully, invitation email sent!"}, status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def generate_invitation_link(email: str) -> str:
    encoded_email = quote(email)
    token = urlsafe_base64_encode(email.encode())
    invitation_link = f"http://localhost:4200/confirm-register/?email={encoded_email}&token={token}"
    return invitation_link


def send_invitation_email(email: str, invitation_link: str) -> None:
    subject = "Complete Your Registration on ZAP"
    message = f"""
        <html>
        <body>
            <p>You have been invited to complete your registration. To do so, please click the following link:</p>
            <a href="{invitation_link}" style="background-color:#00b8c4;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Go to confirm my registration</a>
            <p>If you were not expecting this invitation, please ignore this email.</p>
        </body>
        </html>
    """

    send_mail(subject, "", settings.DEFAULT_FROM_EMAIL, [email], html_message=message)


@api_view(["PUT"])
@permission_classes([AllowAny])
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
@permission_classes([AllowAny])
def send_reset_password_email(request):
    email = request.query_params.get("email")
    user = User.objects.filter(email=email).first()
    if user:
        reset_password_link = generate_reset_password_link(email)
        threading.Thread(target=send_forgot_password_email, args=(email, reset_password_link)).start()

        return Response({"message": "Reset password email sent!"}, status=status.HTTP_200_OK)
    return Response({"error": "Email not found in our app."}, status=status.HTTP_404_NOT_FOUND)


def generate_reset_password_link(email: str) -> str:
    encoded_email = quote(email)
    token = urlsafe_base64_encode(email.encode())
    reset_link = f"http://localhost:4200/forgot-password/?email={encoded_email}&token={token}"
    return reset_link


def send_forgot_password_email(email: str, reset_link: str) -> None:
    subject = "Reset Your Password on ZAP"
    message = f"""
        <html>
        <body>
            <p>We received a request to reset your password. To proceed, please click the following link:</p>
            <a href="{reset_link}" style="background-color:#00b8c4;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset My Password</a>
            <p>If you did not request a password reset, please ignore this email.</p>
        </body>
        </html>
    """

    send_mail(subject, "", settings.DEFAULT_FROM_EMAIL, [email], html_message=message)


@api_view(["PUT"])
@permission_classes([AllowAny])
def confirm_change_password(request):
    email = request.data.get("email")
    password = request.data.get("newPassword")
    user = User.objects.filter(email=email).first()
    if user:
        serializer = UserProfileSerializer(user, data={"password": password}, partial=True)
        if serializer.is_valid():
            serializer.save()
            user.set_password(password)
            user.save()
            return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Error changing password."}, status=status.HTTP_400_BAD_REQUEST)


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
