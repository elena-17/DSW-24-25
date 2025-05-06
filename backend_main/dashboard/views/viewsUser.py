from datetime import datetime, timedelta

from django.db import models
from django.db.models.functions import TruncDay, TruncMonth
from django.utils.timezone import get_current_timezone, make_aware
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from transactions.models import Transaction

tz = get_current_timezone()


@api_view(["GET"])
def user_dashboard(request):
    last_login = request.user.last_login
    if not last_login or last_login.timestamp() == 0:
        last_login_formatted = None
    else:
        last_login_formatted = last_login.isoformat()

    return Response(
        {
            "balance_chart": generate_data_chart(request.user),
            "last_login": last_login_formatted,
            "monthly_chart": get_monthly_chart(request.user),
        },
        status=status.HTTP_200_OK,
    )


def generate_data_chart(user):
    end_date = datetime.now().date() + timedelta(days=1)
    start_date = end_date - timedelta(days=30)

    start_datetime = make_aware(datetime.combine(start_date, datetime.min.time()), timezone=tz)
    end_datetime = make_aware(datetime.combine(end_date, datetime.min.time()), timezone=tz)

    # quiero un grafico que me muestre el dinero enviado por dia y el recibido
    raw_data_sender = (
        Transaction.objects.filter(
            created_at__gte=start_datetime, created_at__lt=end_datetime, sender=user, status="approved"
        )
        .annotate(day=TruncDay("created_at"))
        .values("day")
        .annotate(money_sender=models.Sum("amount"))
        .order_by("day")
    )
    raw_data_receiver = (
        Transaction.objects.filter(
            created_at__gte=start_datetime, created_at__lt=end_datetime, receiver=user, status="approved"
        )
        .annotate(day=TruncDay("created_at"))
        .values("day")
        .annotate(money_receiver=models.Sum("amount"))
        .order_by("day")
    )

    # Convertir los datos a un formato más manejable
    data_by_day = {item["day"]: {"money_sender": item["money_sender"] or 0} for item in raw_data_sender}
    for item in raw_data_receiver:
        if item["day"] not in data_by_day:
            data_by_day[item["day"]] = {"money_receiver": item["money_receiver"] or 0}
        else:
            data_by_day[item["day"]]["money_receiver"] = item["money_receiver"] or 0

    result = []
    for i in range(30):
        day = start_date + timedelta(days=i)
        aware_day = make_aware(datetime.combine(day, datetime.min.time()), timezone=tz)
        result.append(
            {
                "day": day.strftime("%d"),
                "money_sender": data_by_day.get(aware_day, {}).get("money_sender", 0),
                "money_receiver": data_by_day.get(aware_day, {}).get("money_receiver", 0),
            }
        )
    return result


def get_monthly_chart(user):
    end_date = datetime.now().date() + timedelta(days=1)
    start_date = end_date - timedelta(days=6 * 30)  # 6 months

    start_datetime = make_aware(datetime.combine(start_date, datetime.min.time()), timezone=tz)
    end_datetime = make_aware(datetime.combine(end_date, datetime.min.time()), timezone=tz)

    # Enviados por mes (negativos)
    sent_data = (
        Transaction.objects.filter(
            created_at__gte=start_datetime, created_at__lt=end_datetime, sender=user, status="approved"
        )
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(total=models.Sum("amount"))
        .order_by("month")
    )

    # Recibidos por mes (positivos)
    received_data = (
        Transaction.objects.filter(
            created_at__gte=start_datetime, created_at__lt=end_datetime, receiver=user, status="approved"
        )
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(total=models.Sum("amount"))
        .order_by("month")
    )

    # Fusionar los datos en un diccionario por mes
    balances_by_month = {}

    for item in sent_data:
        balances_by_month[item["month"]] = balances_by_month.get(item["month"], 0) - (item["total"] or 0)

    for item in received_data:
        balances_by_month[item["month"]] = balances_by_month.get(item["month"], 0) + (item["total"] or 0)

    result = []
    for i in range(5, -1, -1):
        month = (end_date - timedelta(days=30 * i)).replace(day=1)
        key = make_aware(datetime.combine(month, datetime.min.time()), timezone=tz)
        result.append({"month": key.strftime("%b"), "balance": round(balances_by_month.get(key, 0), 2)})

    return result
