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


@api_view(["GET"])
def get_all_transactions(request):
    transactions = Transaction.objects.filter(sender=request.user) | Transaction.objects.filter(receiver=request.user)
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_all_transactions_sender(request):
    print(request.user)
    transactions = Transaction.objects.filter(sender=request.user)
    print("sender", transactions.values_list())
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_all_transactions_receiver(request):
    print(request.user)
    transactions = Transaction.objects.filter(receiver=request.user)
    print("receiver", transactions.values_list())
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def send_money(request):
    request_data = request.data.copy()
    request_data["sender"] = request.user
    serializer = SendTransactionSerializer(data=request_data, context={"request": request})

    if serializer.is_valid():
        transactions = serializer.save()
        return Response(
            {"message": "Transaction successful", "transactions": [t.id for t in transactions]},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def request_money(request):
    request_data = request.data.copy()
    request_data["receiver"] = request.user
    serializer = RequestTransactionSerializer(data=request_data, context={"request": request})

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

    if transaction.sender != request.user and transaction.receiver != request.user:
        return Response(
            {"error": "You are not authorized to update this transaction."}, status=status.HTTP_403_FORBIDDEN
        )

    serializer = TransactionStatusUpdateSerializer(transaction, data=request.data, partial=True)

    if serializer.is_valid():
        try:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
