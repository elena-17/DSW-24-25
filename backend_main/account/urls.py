from django.urls import path

from .views import addingMoney, get_account, subtractingMoney

app_name = "account"

urlpatterns = [
    path("", get_account, name="get-account"),
    path("recharge/", addingMoney, name="adding-money"),
    path("withdraw/", subtractingMoney, name="subtracting-money"),
]
