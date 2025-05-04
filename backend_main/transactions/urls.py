from django.urls import path

from transactions.views.viewsAdmin import (
    transaction_create,
    transaction_list,
    transaction_update,
)
from transactions.views.viewsUser import (
    confirm_transaction_code,
    get_all_transactions,
    get_transaction,
    login_and_request_money,
    number_pending,
    request_money,
    send_confirmation_code,
    send_money,
    update_transaction_status,
)

# url pattern = /transactions/....
urlpatterns = [
    path("admin/", transaction_list, name="transaction_list"),
    path("admin/<int:id>/", transaction_update, name="transaction_update"),
    path("admin/create/", transaction_create, name="transaction_create"),
    path("", get_all_transactions, name="get_transactions"),
    path("send-money/", send_money, name="send_money"),
    path("request-money/", request_money, name="request_money"),
    path("pending/", number_pending, name="number_pending"),
    path("<int:id>/", get_transaction, name="get_transaction"),
    path("<int:id>/update-status/", update_transaction_status, name="update_transaction_status"),
    path("send-confirmation-code/", send_confirmation_code, name="send_confirmation_code"),
    path("confirm-code/", confirm_transaction_code, name="confirm_transaction_code"),
    path("login-and-request-money/", login_and_request_money, name="login_and_request_money"),
]
