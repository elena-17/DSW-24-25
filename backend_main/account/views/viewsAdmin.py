from decimal import Decimal

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from account.models import Account
from account.serializers import AccountSerializer

@api_view(["GET"])
def get_all_accounts(request):
    accounts = Account.objects.all()
    serializer = AccountSerializer(accounts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["PUT"])
def update_account_balance(request):
    try:
        email = request.data.get("email")
        account = Account.objects.get(user__email=email)
        amount = Decimal(request.data.get("amount"))
        account.balance = amount
        account.save()
        
        serializer = AccountSerializer(account)

        response_data = serializer.data
        response_data["user"] = account.user.email  

        return Response(response_data, status=status.HTTP_200_OK)

    except Account.DoesNotExist:
        return Response({"error": "Account not found"}, status=status.HTTP_404_NOT_FOUND)
