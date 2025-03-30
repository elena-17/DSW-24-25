from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound
from rest_framework.response import Response

from creditcard.models import CreditCard
from creditcard.serializer import CreditCardSerializer


def get_object(number, user):
    try:
        tarjeta = CreditCard.objects.get(number=number, user=user)
        return tarjeta
    except CreditCard.DoesNotExist:
        raise NotFound(detail="Credit card not found or you do not have permission.")


@api_view(["GET"])
def get_all_creditcards(request):
    credit_cards = CreditCard.objects.filter(user=request.user)
    serializer = CreditCardSerializer(credit_cards, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_creditcard(request, number):
    if not number:
        return Response({"detail": "Card number is required."}, status=status.HTTP_400_BAD_REQUEST)

    credit_card = get_object(number, request.user)
    serializer = CreditCardSerializer(credit_card)
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
    # no changes in number are allowed
    if not request.data.get("number"):
        return Response({"detail": "Card number is required."}, status=status.HTTP_400_BAD_REQUEST)
    card = get_object(request.data.get("number"), request.user)
    serializer = CreditCardSerializer(card, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
def delete_creditcard(request):
    number = request.data.get("number", None)
    if not number:
        return Response({"detail": "Card number is required."}, status=status.HTTP_400_BAD_REQUEST)

    credit_card = get_object(number, request.user)
    credit_card.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
