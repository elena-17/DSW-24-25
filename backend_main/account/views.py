from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from account.models import Account
from account.serializers import AccountSerializer


@api_view(["GET"])
def get_account(request):
    try:
        account = Account.objects.get(user=request.user)
        serializer = AccountSerializer(account)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Account.DoesNotExist:
        return Response({"error": "Account not found"}, status=status.HTTP_404_NOT_FOUND)
