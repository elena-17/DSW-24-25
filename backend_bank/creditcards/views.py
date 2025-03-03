from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from creditcards.models import CreditCard
from creditcards.serializers import CreditCardSerializer


@api_view(["POST"])
def validate_credit_card(request):
    serializer = CreditCardSerializer(data=request.data)

    if serializer.is_valid():
        exists = CreditCard.objects.filter(
            number=serializer.validated_data["number"],
            expiration_date=serializer.validated_data["expiration_date"],
            cvv=serializer.validated_data["cvv"],
            owner_name=serializer.validated_data["owner_name"],
        ).exists()
        return Response({"valid": exists}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
