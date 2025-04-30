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
from datetime import datetime, timedelta, date
from django.db.models import Count
from django.utils.timezone import make_aware


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
            "transactions_per_day": get_transactions_per_day(),
        },
        status=status.HTTP_200_OK,
    )


def get_transactions_per_day():
    today = datetime.now().date()
    start_date = today - timedelta(days=29)
    start_datetime = make_aware(datetime.combine(start_date, datetime.min.time()))
    end_datetime = make_aware(
        datetime.combine(today + timedelta(days=1), datetime.min.time())
    )

    raw_data = (
        Transaction.objects.filter(
            created_at__gte=start_datetime, created_at__lt=end_datetime
        )
        .annotate(day=TruncDay("created_at"))
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
    )

    # Convert to dict {day: count}
    data_by_day = {item["day"]: item["count"] for item in raw_data}

    # Fill missing days with 0
    result = []
    for i in range(30):
        day = start_date + timedelta(days=i)
        result.append(
            {
                "day": day.isoformat(),
                "count": data_by_day.get(day, 0),
            }
        )
    return result
