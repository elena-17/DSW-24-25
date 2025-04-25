from django.urls import path

from .views.viewsAdmin import (
    admin_add_block_relation,
    admin_remove_block_relation,
    get_all_block_pairs,
)
from .views.viewsUser import (
    block_user,
    unblock_user,
    get_blocked_users,
    get_non_blocked_users,
)

app_name = "blocks"

urlpatterns = [
    path("", get_blocked_users, name="get-blocked-users"),
    path("non-blocked/", get_non_blocked_users, name="get-non-blocked-users"),
    path("block/", block_user, name="block-user"),
    path("unblock/", unblock_user, name="unblock-user"),
    path("admin/all/", get_all_block_pairs, name="get-all-block-pairs"),
    path("admin/add/", admin_add_block_relation, name="admin-add-block-relation"),
    path("admin/remove/", admin_remove_block_relation, name="admin-remove-block-relation"),
]