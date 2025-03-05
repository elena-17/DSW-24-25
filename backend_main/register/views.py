import requests

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import RegisterSerializer

CREDIT_CARD_VALIDATE_URL = "http://yours/creditscards/validate"


@api_view(["POST"])
def register_user(request):
    credit_card = request.data.get("credit_card")

    if credit_card:
        try:
            # We make a request to the credit card validation service
            response = requests.post(CREDIT_CARD_VALIDATE_URL, data={"credit_card": credit_card})

            # If the response is not 200, we return an error
            if response.status_code != 200:
                return Response({"detail": "Invalid credit card number."}, status=status.HTTP_400_BAD_REQUEST)

        except requests.exceptions.RequestException as e:
            # In the case of an error, we return a 500 status code
            return Response(
                {"detail": f"Error validating credit card: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # We continue with the registration if the credit card is valid
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
