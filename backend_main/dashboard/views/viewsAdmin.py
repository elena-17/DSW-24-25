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


@api_view(["GET"])
def admin_dashboard(request):

    total_users = User.objects.count()
    favorites = Favorite.objects.count()
    blocks = 0
    admins = User.objects.filter(role="admin").count()
    total_transactions = Transaction.objects.count()
    pending_transactions = Transaction.objects.filter(status="pending").count()
    approved_transactions = Transaction.objects.filter(status="approved").count()

    total_money_in_accounts = Account.objects.aggregate(total_money=models.Sum("balance"))["total_money"] or 0
    average_account_balance = Account.objects.aggregate(average_balance=models.Avg("balance"))["average_balance"] or 0
    num_credit_cards = CreditCard.objects.count()

    transactions_per_day = (
        Transaction.objects.annotate(day=TruncDay("created_at"))
        .values("day")
        .annotate(count=models.Count("id"))
        .order_by("day")
    )


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
            "transactions_per_day": transactions_per_day,
        },
        status=status.HTTP_200_OK,
    )
