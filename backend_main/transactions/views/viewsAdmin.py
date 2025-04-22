from datetime import datetime, time
from zoneinfo import ZoneInfo

from django.db.models import Q
from django.shortcuts import get_object_or_404
from mercure.mercure import publish_to_mercure
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response

from transactions.models import Transaction
from transactions.serializers.filter import TransactionFilterSerializer
from transactions.serializers.status import TransactionStatusUpdateSerializer
from transactions.serializers.transactions import TransactionSerializer


@api_view(["GET"])
def transaction_list(request):
    filter_serializer = TransactionFilterSerializer(data=request.GET)

    if not filter_serializer.is_valid():
        return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    data = filter_serializer.validated_data
    queryset = Transaction.objects.select_related("sender", "receiver").all()
    user_tz_str = request.headers.get("X-Timezone", "UTC")

    try:
        user_tz = ZoneInfo(user_tz_str)
    except KeyError:  # Si la zona horaria no es válida
        user_tz = ZoneInfo("UTC")

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

    if "user" in data:
        email = data["user"]
        queryset = queryset.filter(Q(sender__email=email) | Q(receiver__email=email))

    paginator = LimitOffsetPagination()
    paginator.default_limit = 30
    paginated_qs = paginator.paginate_queryset(queryset, request)

    serializer = TransactionSerializer(paginated_qs, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(["PATCH"])
def transaction_update(request, id):
    transaction = get_object_or_404(Transaction, pk=id)

    serializer = TransactionStatusUpdateSerializer(transaction, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def transaction_create(request):
    serializer = TransactionSerializer(data=request.data)
    if serializer.is_valid():
        type_transaction = serializer.validated_data["type"]
        if type_transaction == "send":
            sender = serializer.validated_data["sender"]
            if sender.account.balance < serializer.validated_data["amount"]:
                raise ValidationError({"amount": "Sender insufficient balance for this transaction."})
            sender.account.balance -= serializer.validated_data["amount"]
            sender.account.save()

        serializer.save()
        topic = (
            f"user/{serializer.validated_data['receiver']}"
            if type_transaction == "send"
            else f"user/{serializer.validated_data['sender']}"
        )
        publish_to_mercure(topic, serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
