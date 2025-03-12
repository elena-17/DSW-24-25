@echo off
python manage.py migrate
python manage.py runserver 8000
