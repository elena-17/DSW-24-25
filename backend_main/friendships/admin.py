from django.contrib import admin

from .models import Favorite


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "favorite_user", "created_at")
    search_fields = ("user__email", "favorite_user__email")
    list_filter = ("created_at",)
