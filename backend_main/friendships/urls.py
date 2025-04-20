from django.urls import path

from .views import get_users_sorted_by_favorites, get_favorite_users, add_to_favorites, remove_from_favorites
app_name = "favorites"

urlpatterns = [
    path("users/", get_users_sorted_by_favorites, name="get-users-sorted-by-favorites"),
    path("", get_favorite_users, name="get-favorite-users"),
    path("add/", add_to_favorites, name="add-to-favorites"),
    path("remove/", remove_from_favorites, name="remove-from-favorites"),
]
