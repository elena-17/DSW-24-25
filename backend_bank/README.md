# BACKEND BANK

This project was generated using:

```bash
django-admin startproject backend_bank
```

To create a new app (a module within the project), use:

```bash
python manage.py startapp <app_name>
```

To run the server, use:

```bash
python manage.py runserver 8080
```

## API ENDPOINTS

- `POST /api/validate/`: Validates a bank account number.
Request body:
```json
{
    "number": "string",
    "owner_name": "string",
    "expiration_date": "YYYY-MM-DD",
    "cvv": "string"
}
```
Response:
* 200 OK: The account is valid or not.
```json
{
    "valid": true
}
```
* 400 Bad Request: The request is invalid.
```json
{
    "error": "string"
}
```
