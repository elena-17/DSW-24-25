from django.db.models import Q
from django.shortcuts import get_object_or_404
from mercure.mercure import publish_to_mercure
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from transactions.models import Transaction
from transactions.serializers.send_request import (
    RequestTransactionSerializer,
    SendTransactionSerializer,
)
from transactions.serializers.status import TransactionStatusUpdateSerializer
from transactions.serializers.transactions import TransactionSerializer


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
    transactions = Transaction.objects.filter(sender=request.user)
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_all_transactions_receiver(request):
    transactions = Transaction.objects.filter(receiver=request.user)
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def number_pending(request):
    """
    get number of pending transactions
    """
    transactions = Transaction.objects.filter(
        (
            (Q(receiver=request.user) & Q(status="pending") & Q(type="send"))
            | (Q(sender=request.user) & Q(status="pending") & Q(type="request"))
        )
    )
    serializer = TransactionSerializer(transactions, many=True)
    return Response({"number_pending": len(serializer.data)}, status=status.HTTP_200_OK)


@api_view(["POST"])
def send_money(request):
    request_data = request.data.copy()
    request_data["sender"] = request.user
    serializer = SendTransactionSerializer(data=request_data, context={"request": request})

    if serializer.is_valid():
        transactions = serializer.save()
        tr_serialized = TransactionSerializer(transactions, many=True)
        for transaction in tr_serialized.data:
            topic = f"user/{transaction["receiver"]}"
            publish_to_mercure(topic, transaction)
        return Response(
            {"message": "Transaction successful", "transactions": tr_serialized.data},
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
        tr_serialized = TransactionSerializer(transactions, many=True)
        for transaction in tr_serialized.data:
            topic = f"user/{transaction["sender"]}"
            publish_to_mercure(topic, transaction)
        return Response(
            {"message": "Transaction successful", "transactions": tr_serialized.data},
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
