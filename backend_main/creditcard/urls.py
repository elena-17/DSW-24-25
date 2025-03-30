from django.urls import path

from .views import (
    delete_creditcard,
    get_all_creditcards,
    get_creditcard,
    post_creditcard,
    put_creditcard,
)

app_name = "creditcard"

urlpatterns = [
    path("", get_all_creditcards, name="creditcard-list"),
    path("create/", post_creditcard, name="creditcard-create"),
    path("update/", put_creditcard, name="creditcard-update"),
    path("delete/", delete_creditcard, name="creditcard-delete"),
    path("<str:number>/", get_creditcard, name="creditcard-detail"),
]
