FROM python:3.12-slim

WORKDIR /app

COPY . /app/

RUN apt-get update \
    && apt-get -y install libpq-dev gcc

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && gunicorn backend_main.wsgi:application --bind 0.0.0.0:8000"]
