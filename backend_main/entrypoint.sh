#!/bin/bash
python manage.py migrate

python manage.py shell < create_superuser.py

exec gunicorn backend_main.wsgi:application --bind 0.0.0.0:8000
