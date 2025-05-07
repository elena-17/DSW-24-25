# create_superuser.py

import os
from django.contrib.auth import get_user_model

User = get_user_model()

username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin@example.com")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "SecurePassword1")
id_number = os.environ.get("DJANGO_SUPERUSER_ID_NUMBER", "00000001")
phone = os.environ.get("DJANGO_SUPERUSER_PHONE", "0000000000")

if not User.objects.filter(email=username).exists():
    User.objects.create_superuser(
        id_number=id_number,
        email=username,
        phone=phone,
        password=password,
    )
    print(f"Superuser created: {username}")
else:
    print(f"Superuser already exists: {username}")
