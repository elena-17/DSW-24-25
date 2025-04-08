from rest_framework.decorators import api_view
from rest_framework.pagination import LimitOffsetPagination

from transactions.models import Transaction
from transactions.serializer import TransactionSerializer


@api_view(["GET"])
def transaction_list(request):
    queryset = Transaction.objects.all()

    status = request.get("status")
    type_ = request.get("type")
    min_amount = request.get("min_amount")
    max_amount = request.get("max_amount")
    title = request.get("title")
    sender = request.get("sender")
    receiver = request.get("receiver")
    date_start = request.get("date_start")
    date_end = request.get("date_end")

    if status:
        queryset = queryset.filter(status=status)
    if type_:
        queryset = queryset.filter(type=type_)
    if min_amount:
        queryset = queryset.filter(amount__gte=min_amount)
    if max_amount:
        queryset = queryset.filter(amount__lte=max_amount)
    if title:
        queryset = queryset.filter(title__icontains=title)
    if sender:
        queryset = queryset.filter(sender_id=sender)
    if receiver:
        queryset = queryset.filter(receiver_id=receiver)
    if date_start:
        queryset = queryset.filter(created_at__gte=date_start)
    if date_end:
        queryset = queryset.filter(created_at__lte=date_end)

    paginator = LimitOffsetPagination()
    paginator.default_limit = 30
    paginated_qs = paginator.paginate_queryset(queryset, request)

    serializer = TransactionSerializer(paginated_qs, many=True)
    return paginator.get_paginated_response(serializer.data)
