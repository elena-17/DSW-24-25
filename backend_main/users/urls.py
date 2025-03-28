from django.urls import include, path
from rest_framework.routers import DefaultRouter
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

# We create router for UserViewSet
router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")

urlpatterns = [
    path("register/", register_user, name="register_user"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login_user"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", get_user_profile, name="get_user_profile"),
    path("profile/update/", update_user_profile, name="update_user_profile"),
    path("profile/password/", change_user_password, name="change_user_password"),
    path("profile/delete/", delete_user_account, name="delete_user_account"),
    path("", include(router.urls)),
    path("users/delete/<str:email>/", UserViewSet.as_view({"delete": "delete_by_email"}), name="user-delete"),
    #path("users/get/<str:email>/", UserViewSet.as_view({"get": "get_user_by_email"}), name="user-get-by-email"), # Delete in future if not needed, cause we are not using it in frontend
    path(
        "users/update/<str:email>/", UserViewSet.as_view({"put": "update_user_by_email"}), name="user-update-by-email"
    ), 
]
