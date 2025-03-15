from django.contrib import admin

from .models import FriendRequest, Friendship


@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ("user1", "user2")


@admin.register(FriendRequest)
class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ("sender", "receiver", "status")
    list_filter = ("status",)
    search_fields = ("sender__name", "receiver__name")
