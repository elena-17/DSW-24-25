from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Transaction
from .serializer import (
    RequestTransactionSerializer,
    SendTransactionSerializer,
    TransactionSerializer,
    TransactionStatusUpdateSerializer,
)


@api_view(["GET"])
def get_transaction(request, id):
    """
    get transaction by id
    """
    transaction = get_object_or_404(Transaction, pk=id)
    serializer = TransactionSerializer(transaction)
    return Response(serializer.data, status=status.HTTP_200_OK)


"""GET all transactions by email sender"""

"""GET all transactions by email receiver"""


@api_view(["POST"])
def send_money(request):
    serializer = SendTransactionSerializer(data=request.data)

    if serializer.is_valid():
        transactions = serializer.save()
        return Response(
            {"message": "Transaction successful", "transactions": [t.id for t in transactions]},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def request_money(request):
    serializer = RequestTransactionSerializer(data=request.data)

    if serializer.is_valid():
        transactions = serializer.save()
        return Response(
            {"message": "Transaction successful", "transactions": [t.id for t in transactions]},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
def update_transaction_status(request, id):
    transaction = get_object_or_404(Transaction, pk=id)
    serializer = TransactionStatusUpdateSerializer(transaction, data=request.data, partial=True)

    if serializer.is_valid():
        try:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
