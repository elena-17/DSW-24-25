from django.urls import path

from .views.viewsUser import adding_money, get_account, subtracting_money
from .views.viewsAdmin import get_all_accounts, update_account_balance
app_name = "account"

urlpatterns = [
    path("", get_account, name="get-account"),
    path("recharge/", adding_money, name="adding-money"),
    path("withdraw/", subtracting_money, name="subtracting-money"),
    path("accounts/", get_all_accounts, name="get-accounts"),
    path("update/", update_account_balance, name="update-account-balance")
]
