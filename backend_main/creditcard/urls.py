from django.urls import path
from .views import (
    get_creditcards,
    post_creditcard,
    put_creditcard,
    delete_creditcard,
)

app_name = "creditcard"

urlpatterns = [
    path("creditcards/", get_creditcards, name="creditcard-list"),
    path("creditcards/create/", post_creditcard, name="creditcard-create"),
    path("creditcards/update/", put_creditcard, name="creditcard-update"), 
    path("creditcards/delete/", delete_creditcard, name="creditcard-delete"), 
]