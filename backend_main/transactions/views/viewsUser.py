from django.db.models import Q
from django.shortcuts import get_object_or_404
from mercure.mercure import publish_to_mercure
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response

from transactions.models import Transaction
from transactions.serializers.filter import TransactionFilterSerializer
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
    """
    Endpoint unificado para transacciones de usuario:
    /api/transactions/&type=send|request
        &status=pending,approved,rejected
        &min_amount=&max_amount=
        &date_start=YYYY-MM-DD
        &date_end=YYYY-MM-DD
        &limit=&offset=
    """
    pending_type = request.GET.get("pending_type")
    params = request.GET.copy()
    params.pop("pending_type", None)
    filter_serializer = TransactionFilterSerializer(data=params)

    if not filter_serializer.is_valid():
        return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    data = filter_serializer.validated_data
    user = request.user
    if pending_type == "pendingMyApproval":
        queryset = Transaction.objects.filter(
            (Q(type="send") & Q(receiver=user)) | (Q(type="request") & Q(sender=user))
        )
    elif pending_type == "pendingOthers":
        queryset = Transaction.objects.filter(
            (Q(type="send") & Q(sender=user)) | (Q(type="request") & Q(receiver=user))
        )
    else:
        if data.get("type") == "send":
            queryset = Transaction.objects.filter(sender=user)
        elif data.get("type") == "request":
            queryset = Transaction.objects.filter(receiver=user)
        else:
            queryset = Transaction.objects.filter(Q(sender=user) | Q(receiver=user))

    filter_fields = {
        "min_amount": "amount__gte",
        "max_amount": "amount__lte",
        "title": "title__icontains",
        "date_start": "created_at__gte",
        "date_end": "created_at__lte",
        "status": "status__in",
    }

    for field, lookup in filter_fields.items():
        if field in data:
            queryset = queryset.filter(**{lookup: data[field]})
    paginator = LimitOffsetPagination()
    paginator.default_limit = 30
    paginated_qs = paginator.paginate_queryset(queryset.order_by("-created_at"), request)

    serializer = TransactionSerializer(paginated_qs, many=True)
    return paginator.get_paginated_response(serializer.data)


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
            topic = f"user/{transaction['receiver']}"
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
            topic = f"user/{transaction['sender']}"
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
            {"error": "You are not authorized to update this transaction."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = TransactionStatusUpdateSerializer(transaction, data=request.data, partial=True)

    if serializer.is_valid():
        try:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
