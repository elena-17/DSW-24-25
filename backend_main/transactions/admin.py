from django.contrib import admin

from .models import MoneyRequest, Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("sender", "receiver", "amount", "date", "title")


@admin.register(MoneyRequest)
class MoneyRequestAdmin(admin.ModelAdmin):
    list_display = ("requester", "requested_from", "amount", "date_requested", "title", "status")
