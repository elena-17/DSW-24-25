from django.urls import path

from healthz.views import health_check

urlpatterns = [
    path("", health_check, name="health_check"),
]
