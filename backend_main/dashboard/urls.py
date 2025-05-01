from django.urls import path

from .views.viewsAdmin import admin_dashboard
from .views.viewsUser import user_dashboard

urlpatterns = [
    path("admin/", admin_dashboard, name="dashboard-admin"),
    path("user/", user_dashboard, name="dashboard-user"),
]
