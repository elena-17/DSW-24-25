from decimal import Decimal, DecimalException

from account.models import Account
from account.serializers import AccountSerializer
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def get_all_accounts(request):
    accounts = Account.objects.all()
    serializer = AccountSerializer(accounts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["PUT"])
def update_account_balance(request):
    try:
        amount = Decimal(request.data.get("amount"))
    except (ValueError, TypeError, DecimalException):
        return Response({"amount": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

    if amount < 0:
        return Response({"amount": "Amount must be positive"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        email = request.data.get("email")
        account = Account.objects.get(user__email=email)
        account.balance = amount
        account.save()

        serializer = AccountSerializer(account)

        response_data = serializer.data
        response_data["user"] = account.user.email

        return Response(response_data, status=status.HTTP_200_OK)

    except Account.DoesNotExist:
        return Response({"error": "Account not found"}, status=status.HTTP_404_NOT_FOUND)
