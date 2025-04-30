from account.models import Account
from creditcard.models import CreditCard
from django.db import models
from django.db.models.functions import TruncDay
from friendships.models import Favorite
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from transactions.models import Transaction
from users.models import User
from datetime import datetime, timedelta
from django.db.models import Count
from django.utils.timezone import make_aware, get_current_timezone


tz = get_current_timezone()

@api_view(["GET"])
def admin_dashboard(request):

    total_users = User.objects.count()
    favorites = Favorite.objects.count()
    blocks = 0
    admins = User.objects.filter(role="admin").count()
    total_transactions = Transaction.objects.count()
    pending_transactions = Transaction.objects.filter(status="pending").count()
    approved_transactions = Transaction.objects.filter(status="approved").count()

    total_money_in_accounts = (
        Account.objects.aggregate(total_money=models.Sum("balance"))["total_money"] or 0
    )
    average_account_balance = (
        Account.objects.aggregate(average_balance=models.Avg("balance"))[
            "average_balance"
        ]
        or 0
    )
    num_credit_cards = CreditCard.objects.count()
    print(get_transactions_per_day())
    return Response(
        {
            "total_users": total_users,
            "favorites": favorites,
            "blocks": blocks,
            "admins": admins,
            "total_transactions": total_transactions,
            "pending_transactions": pending_transactions,
            "approved_transactions": approved_transactions,
            "total_money_in_accounts": total_money_in_accounts,
            "average_account_balance": average_account_balance,
            "num_credit_cards": num_credit_cards,
            "transactions_chart": get_transactions_per_day(),
        },
        status=status.HTTP_200_OK,
    )


def get_transactions_per_day():
    end_date = datetime.now().date() + timedelta(days=1)
    start_date = end_date - timedelta(days=30)

    start_datetime = make_aware(datetime.combine(start_date, datetime.min.time()), timezone=tz)
    end_datetime = make_aware(datetime.combine(end_date, datetime.min.time()), timezone=tz)

    # Obtener los conteos de transacciones por día
    raw_data = (
        Transaction.objects
        .filter(created_at__gte=start_datetime, created_at__lt=end_datetime)
        .annotate(day=TruncDay("created_at"))
        .values("day")
        .annotate(
            count=Count("id"),
            total_amount=models.Sum("amount")
        )
        .order_by("day")
    )
    # Convert to dict {day: count}
    data_by_day = {item["day"]: {"count": item["count"], "total_amount": item["total_amount"] or 0} for item in raw_data}
    # Fill missing days with 0
    result = []
    for i in range(30):
        day = start_date + timedelta(days=i)
        aware_day = make_aware(datetime.combine(day, datetime.min.time()), timezone=tz)
        result.append(
            {
                "day": day.strftime("%d-%m"),
                "count": data_by_day.get(aware_day, {}).get("count", 0),
                "total_amount": data_by_day.get(aware_day, {}).get("total_amount", 0),
            }
        )
    return result
