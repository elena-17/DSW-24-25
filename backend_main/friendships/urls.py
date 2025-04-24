from django.urls import path

from .views.viewsAdmin import (
    admin_add_favorite_relation,
    admin_remove_favorite_relation,
    get_all_favorite_pairs,
)
from .views.viewsUser import (
    add_to_favorites,
    get_favorite_users,
    get_non_favorite_users,
    remove_from_favorites,
)

app_name = "favorites"

urlpatterns = [
    path("", get_favorite_users, name="get-favorite-users"),
    path("non-favorites/", get_non_favorite_users, name="get-non-favorite-users"),
    path("add/", add_to_favorites, name="add-to-favorites"),
    path("remove/", remove_from_favorites, name="remove-from-favorites"),
    path("admin/all/", get_all_favorite_pairs, name="get-all-favorite-pairs"),
    path("admin/add/", admin_add_favorite_relation, name="admin-add-favorite-relation"),
    path("admin/remove/", admin_remove_favorite_relation, name="admin-remove-favorite-relation"),
]
