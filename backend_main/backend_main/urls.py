"""
URL configuration for backend_main project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from login.views import login_user
from register.views import register_user
from userSettings.views import (
    delete_user_account,
    get_user_profile,
    update_user_profile,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("register/", register_user, name="register_user"),
    path("login/", login_user, name="login_user"),
    path("user/profile/", get_user_profile, name="get_user_profile"),
    path("user/profile/update/", update_user_profile, name="update_user_profile"),
    path("user/delete/", delete_user_account, name="delete_user_account"),
]
