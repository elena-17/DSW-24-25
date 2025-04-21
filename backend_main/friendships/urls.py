from django.urls import path

from .views.viewsUser import (
    add_to_favorites,
    get_favorite_users,
    remove_from_favorites,
    get_non_favorite_users,
)

app_name = "favorites"

urlpatterns = [
    path("", get_favorite_users, name="get-favorite-users"),
    path("non-favorites/", get_non_favorite_users, name="get-non-favorite-users"),
    path("add/", add_to_favorites, name="add-to-favorites"),
    path("remove/", remove_from_favorites, name="remove-from-favorites"),
]
