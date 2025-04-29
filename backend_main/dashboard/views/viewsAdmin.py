from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from users.models import User
from friendships.models import Favorite
from transactions.models import Transaction
from account.models import Account
from creditcard.models import CreditCard

from django.db import models
@api_view(['GET'])
def admin_dashboard(request):

    total_users = User.objects.count()
    friendships = Favorite.objects.count()
    total_transactions = Transaction.objects.count()
    pending_transactions = Transaction.objects.filter(status='pending').count()
    total_money_in_accounts = Account.objects.aggregate(total_money=models.Sum('balance'))['total_money'] or 0
    average_account_balance = Account.objects.aggregate(average_balance=models.Avg('balance'))['average_balance'] or 0
    num_credit_cards = CreditCard.objects.count()

    return Response({
        "total_users": total_users,
        "friendships": friendships,
        "total_transactions": total_transactions,
        "pending_transactions": pending_transactions,
        "total_money_in_accounts": total_money_in_accounts,
        "average_account_balance": average_account_balance,
        "num_credit_cards": num_credit_cards,
    }, status=status.HTTP_200_OK)