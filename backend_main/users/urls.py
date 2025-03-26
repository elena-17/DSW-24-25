from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views.viewsAdmin import UserViewSet
from .views.viewsUser import (
    CustomTokenObtainPairView,
    change_user_password,
    delete_user_account,
    get_user_profile,
    register_user,
    update_user_profile,
)

app_name = "user"
urlpatterns = [
    path("register/", register_user, name="register_user"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login_user"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", get_user_profile, name="get_user_profile"),
    path("profile/update/", update_user_profile, name="update_user_profile"),
    path("profile/password/", change_user_password, name="change_user_password"),
    path("profile/delete/", delete_user_account, name="delete_user_account"),
    path("users/bulk-delete/", UserViewSet.as_view({"delete": "bulk_delete"}), name="bulk_delete"),
    path("get-all-users/", UserViewSet.as_view({"get": "get_all_users"}), name="get_all_users"),
]
