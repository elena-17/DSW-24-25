#!/bin/bash

python manage.py migrate
python manage.py collectstatic --noinput

exec gunicorn backend_bank.wsgi:application --bind 0.0.0.0:8000
