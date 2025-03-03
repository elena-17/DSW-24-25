from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from creditcards.models import CreditCard
from creditcards.serializers import CreditCardSerializer


@api_view(["POST"])
def validate_credit_card(request):
    serializer = CreditCardSerializer(data=request.data)

    if serializer.is_valid():
        exists = CreditCard.objects.filter(**serializer.validated_data).exists()
        return Response({"valid": exists}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
