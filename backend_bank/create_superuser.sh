#!/bin/bash

# Superuser vars
DJANGO_SUPERUSER_USERNAME=${DJANGO_SUPERUSER_USERNAME:-admin@example.com}
DJANGO_SUPERUSER_PASSWORD=${DJANGO_SUPERUSER_PASSWORD:-SecurePassword1}
DJANGO_SUPERUSER_ID_NUMBER=${DJANGO_SUPERUSER_ID_NUMBER:-00000001}
DJANGO_SUPERUSER_PHONE=${DJANGO_SUPERUSER_PHONE:-0000000000}

python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email="$DJANGO_SUPERUSER_USERNAME").exists():
    User.objects.create_superuser(
        id_number="$DJANGO_SUPERUSER_ID_NUMBER",
        email="$DJANGO_SUPERUSER_USERNAME",
        phone="$DJANGO_SUPERUSER_PHONE",
        password="$DJANGO_SUPERUSER_PASSWORD"
    )
EOF
