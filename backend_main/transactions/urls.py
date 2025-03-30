# urls.py
from django.urls import path

from .views import (
    get_all_transactions,
    get_transaction,
    request_money,
    send_money,
    update_transaction_status,
)

# url pattern = /transaction/....
urlpatterns = [
    path("", get_all_transactions, name="get_transactions"),
    path("sender/", get_all_transactions, name="get_transactions_sender"),
    path("receiver/", get_all_transactions, name="get_transactions_receiver"),
    path("send-money/", send_money, name="send_money"),
    path("request-money/", request_money, name="request_money"),
    path("<int:id>/", get_transaction, name="get_transaction"),
    path("<int:id>/update-status/", update_transaction_status, name="update_transaction_status"),
]
