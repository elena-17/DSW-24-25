from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from users.serializers.token import CustomTokenObtainPairSerializer

from creditcard.models import CreditCard
from creditcard.serializer import CreditCardSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


def get_object(number, user):
    try:
        tarjeta = CreditCard.objects.get(number=number, user_id=user.id_number)
        return tarjeta
    except CreditCard.DoesNotExist:
        raise NotFound(detail="Credit card not found or you do not have permission.")


@api_view(["GET"])
def get_creditcards(request):
    number = request.query_params.get("number", None)
    if number:
        credit_card = get_object(number, request.user.id_number)
        serializer = CreditCardSerializer(credit_card)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        credit_cards = CreditCard.objects.filter(user=request.user.id_number)
        serializer = CreditCardSerializer(credit_cards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def post_creditcard(request):
    serializer = CreditCardSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
def put_creditcard(request):
    number = request.data.get("number", None)
    if not number:
        return Response({"detail": "Card number is required."}, status=status.HTTP_400_BAD_REQUEST)
    print(f"🔍 Comparación directa: {request.user == CreditCard.objects.first().user}")
    credit_card = get_object(number, request.user)
    print(f"🛠 Found credit card: {credit_card.number}")  # Mostramos la tarjeta encontrada
    serializer = CreditCardSerializer(credit_card, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        # Update the user instance to reflect any changes made to the serializer
        credit_card.refresh_from_db()
        request.user.refresh_from_db()
        return Response(serializer.data, status=status.HTTP_200_OK)
    print(f"🛠 Invalid serializer: {serializer.errors}")  # Si falla la validación
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
def delete_creditcard(request):
    number = request.data.get("number", None)
    if not number:
        return Response({"detail": "Card number is required."}, status=status.HTTP_400_BAD_REQUEST)

    credit_card = get_object(number, request.user)
    credit_card.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
