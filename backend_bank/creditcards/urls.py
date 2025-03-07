from django.urls import path

from . import views

app_name = "creditcards"
urlpatterns = [path("validate/", views.validate_transaction, name="validate_credit_card")]
