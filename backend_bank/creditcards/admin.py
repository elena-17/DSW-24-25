from django.contrib import admin

from .models import CreditCard


class CreditCardAdmin(admin.ModelAdmin):
    list_display = ["number", "owner_name", "expiration_date", "cvv"]
    list_filter = ["owner_name", "expiration_date"]
    search_fields = ["number"]


admin.site.register(CreditCard, CreditCardAdmin)
