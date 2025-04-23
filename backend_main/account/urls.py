from django.urls import path

from .views.viewsAdmin import get_all_accounts, update_account_balance
from .views.viewsUser import (
    adding_money,
    get_account,
    paymentRequest,
    subtracting_money,
)

app_name = "account"

urlpatterns = [
    path("", get_account, name="get-account"),
    path("recharge/", adding_money, name="adding-money"),
    path("withdraw/", subtracting_money, name="subtracting-money"),
    path("payment-request/", paymentRequest, name="payment-request"),
    path("accounts/", get_all_accounts, name="get-accounts"),
    path("update/", update_account_balance, name="update-account-balance"),
]
