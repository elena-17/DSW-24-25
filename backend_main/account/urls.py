from django.urls import path

from .views import adding_money, get_account, subtracting_money

app_name = "account"

urlpatterns = [
    path("", get_account, name="get-account"),
    path("recharge/", adding_money, name="adding-money"),
    path("withdraw/", subtracting_money, name="subtracting-money"),
]
