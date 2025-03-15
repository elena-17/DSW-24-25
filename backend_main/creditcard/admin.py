from django.contrib import admin

from .models import CreditCard


@admin.register(CreditCard)
class CreditCardAdmin(admin.ModelAdmin):
    list_display = ("number", "expiration_date", "cvv", "user", "card_alias", "is_default")
