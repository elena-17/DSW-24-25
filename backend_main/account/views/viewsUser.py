from decimal import Decimal

import stripe

from account.models import Account
from account.serializers import AccountSerializer
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def get_account(request):
    try:
        account = Account.objects.get(user=request.user)
        serializer = AccountSerializer(account)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Account.DoesNotExist:
        return Response({"error": "Account not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PUT"])
def adding_money(request):
    try:
        account = Account.objects.get(user=request.user)
        amount = Decimal(request.data.get("amount"))
        account.balance += amount
        account.save()
        serializer = AccountSerializer(account)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Account.DoesNotExist:
        return Response({"error": "Account not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PUT"])
def subtracting_money(request):
    try:
        account = Account.objects.get(user=request.user)
        amount = Decimal(request.data.get("amount"))
        if account.balance >= amount:
            account.balance -= amount
            account.save()
            serializer = AccountSerializer(account)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Insufficient funds"}, status=status.HTTP_400_BAD_REQUEST)
    except Account.DoesNotExist:
        return Response({"error": "Account not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PUT"])
def paymentRequest(request):
    stripe.api_key = settings.SECRET_KEY_STRIPE
    print(stripe.api_key)
    try:
        amount = Decimal(request.data.get("amount"))
        if amount <= 0:
            return Response({"error": "Amount must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)

        amount_in_cents = int(amount * 100)
        intent = stripe.PaymentIntent.create(
            amount=amount_in_cents,
            currency="eur",
        )

        return Response({"client_secret": intent.client_secret}, status=status.HTTP_200_OK)
    except stripe.error.StripeError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response({"error": "Something went wrong"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
