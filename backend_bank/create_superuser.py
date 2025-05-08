# create_superuser.py

import os
from django.contrib.auth import get_user_model

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend_bank.settings")

import django
django.setup()

User = get_user_model()

username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin@example.com")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "SecurePassword1")

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(
        username=username,
        email=username,
        password=password,
    )
    print(f"Superuser created: {username}")
else:
    print(f"Superuser already exists: {username}")
