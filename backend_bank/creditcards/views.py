from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from creditcards.models import CreditCard
from creditcards.serializers import CreditCardSerializer

LIMIT = 2000


@api_view(["POST"])
def validate_transaction(request):
    serializer = CreditCardSerializer(data=request.data)

    if serializer.is_valid():
        amount = serializer.validated_data.pop("amount")
        card_exists = CreditCard.objects.filter(**serializer.validated_data).exists()

        if amount > LIMIT:
            return Response(
                {"valid": False, "message": "Transaction amount exceeds the limit"},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response({"valid": card_exists}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
