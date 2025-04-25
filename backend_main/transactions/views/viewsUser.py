from datetime import datetime, time
import re
from zoneinfo import ZoneInfo

from django.db.models import Q
from django.shortcuts import get_object_or_404
from users.models import User
from blocks.models import Block
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
        &title=&user=
        &min_amount=&max_amount=
        &date_start=DD-MM-YYYY
        &date_end=DD-MM-YYYY
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
    other_user_email = data.get("user")
    user_tz_str = request.headers.get("X-Timezone", "UTC")
    try:
        user_tz = ZoneInfo(user_tz_str)
    except KeyError:  # Si la zona horaria no es válida
        user_tz = ZoneInfo("UTC")

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

    if other_user_email:
        queryset = queryset.filter(Q(sender__email=other_user_email) | Q(receiver__email=other_user_email))

    filter_fields = {
        "min_amount": "amount__gte",
        "max_amount": "amount__lte",
        "title": "title__icontains",
        "status": "status__in",
    }

    for field, lookup in filter_fields.items():
        if field in data:
            queryset = queryset.filter(**{lookup: data[field]})

    if "date_start" in data:
        start_dt_local = datetime.combine(data["date_start"], time.min).replace(tzinfo=user_tz)
        start_dt_utc = start_dt_local.astimezone(ZoneInfo("UTC"))
        queryset = queryset.filter(created_at__gte=start_dt_utc)

    if "date_end" in data:
        end_dt_local = datetime.combine(data["date_end"], time.max).replace(tzinfo=user_tz)
        end_dt_utc = end_dt_local.astimezone(ZoneInfo("UTC"))
        queryset = queryset.filter(created_at__lte=end_dt_utc)

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
















def is_blocked(blocker_email, blocked_email):
    blocker = User.objects.filter(email=blocker_email).first()
    blocked = User.objects.filter(email=blocked_email).first()

    if not blocker or not blocked:
        return False  

    return Block.objects.filter(user=blocker, blocked_user=blocked).exists()

@api_view(["POST"])
def send_money(request):
    request_data = request.data.copy()
    request_data["sender"] = request.user
    receivers = request_data.get("receivers")  
    print(f"Receivers: {receivers}")

    # Verificar si el usuario está bloqueado por cualquiera de los receptores
    for receiver_user in receivers:
        if is_blocked(receiver_user, request.user):
            print(f"User {request.user} is blocked by {receiver_user}.")
            return Response(
                {"error": f"You are blocked by the recipient ({receiver_user}). Transaction cannot be completed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        print(f"User {request.user} is not blocked by {receiver_user}.")
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

    senders = request_data.get("senders")
    for sender_user in senders:
        if is_blocked(sender_user, request.user):
            print(f"User {request.user} is blocked by {sender_user}.")
            return Response(
                {"error": f"You are blocked by the sender ({sender_user}). Transaction cannot be completed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        print(f"User {request.user} is not blocked by {sender_user}.")

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
