@echo off
docker compose up -d db_main

echo Esperando a que la base de datos este lista...
timeout /t 5 /nobreak >nul

python manage.py migrate
python manage.py runserver 8000
