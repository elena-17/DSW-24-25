FROM python:3.12-slim

WORKDIR /app

COPY . /app/

RUN apt-get update \
    && apt-get -y install libpq-dev gcc curl\
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

RUN chmod +x /app/create_superuser.sh

RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

CMD ["/app/entrypoint.sh"]
