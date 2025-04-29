from django.urls import path

from .views.viewsAdmin import admin_dashboard

urlpatterns = [
    path("/admin", admin_dashboard, name="dashboard-admin"),
]