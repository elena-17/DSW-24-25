@echo off
docker compose up -d db_main mercure

echo Esperando a que la base de datos este lista...
timeout /t 2 /nobreak >nul

python manage.py migrate
python manage.py runserver 8000
