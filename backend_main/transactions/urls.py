# urls.py
from django.urls import path

from .views import get_transaction, request_money, send_money, update_transaction_status

# url pattern = /transaction/....
urlpatterns = [
    path("send-money/", send_money, name="send_money"),
    path("request-money/", request_money, name="request_money"),
    path("<int:id>/", get_transaction, name="get_transaction"),
    path("<int:id>/update-status/", update_transaction_status, name="update_transaction_status"),
]
