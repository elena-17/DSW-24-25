from django.urls import path

from users.views.login import login_user
from users.views.user import (
    delete_user_account,
    get_user_profile,
    register_user,
    update_user_profile,
)

app_name = "user"
urlpatterns = [
    path("register/", register_user, name="register_user"),
    path("login/", login_user, name="login_user"),
    path("user/profile/", get_user_profile, name="get_user_profile"),
    path("user/profile/update/", update_user_profile, name="update_user_profile"),
    path("user/delete/", delete_user_account, name="delete_user_account"),
]
