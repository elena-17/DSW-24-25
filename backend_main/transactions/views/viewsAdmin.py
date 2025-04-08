from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from transactions.models import Transaction
from transactions.serializer import TransactionSerializer


from rest_framework.response import Response
from rest_framework.pagination import LimitOffsetPagination
from django.db.models import Q

@api_view(["GET"])
def transaction_list(request):
    queryset = Transaction.objects.all()
    
    try: 
        status = request.GET.get("status")
        type_ = request.GET.get("type")
        min_amount = request.GET.get("min_amount")
        max_amount = request.GET.get("max_amount")
    except ValueError:
        return Response({"error": "Invalid query parameters"}, status=status.HTTP_400_BAD_REQUEST)
    
    if status:
        queryset = queryset.filter(status=status)
    if type_:
        queryset = queryset.filter(type=type_)
    if min_amount:
        queryset = queryset.filter(amount__gte=min_amount)
    if max_amount:
        queryset = queryset.filter(amount__lte=max_amount)

    # Paginación manual
    paginator = LimitOffsetPagination()
    paginator.default_limit = 30
    paginated_qs = paginator.paginate_queryset(queryset, request)

    serializer = TransactionSerializer(paginated_qs, many=True)
    return paginator.get_paginated_response(serializer.data)
