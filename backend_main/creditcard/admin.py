from django.contrib import admin

from .models import CreditCard


@admin.register(CreditCard)
class CreditCardAdmin(admin.ModelAdmin):
    list_display = ("number", "expiration_date", "user", "card_alias")
