from django.contrib import admin
from .models import Block

@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ("user", "blocked_user", "created_at")
    search_fields = ("user__email", "blocked_user__email")
    list_filter = ("created_at",)