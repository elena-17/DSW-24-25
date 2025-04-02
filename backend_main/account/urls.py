from django.urls import path

from .views import (
    get_account,
)

app_name = "account"

urlpatterns = [
    path("", get_account, name="get-account"),
]
