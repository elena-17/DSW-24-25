# Backend Bank

This project is a Django-based backend for simulating a bank system API. It validates a credit card transaction and checks if the transaction amount exceeds a predefined limit.

The databased used is PostgreSQL, and the project is designed to be run in a Docker container for easy deployment and management.

## 📋 Table of Contents
- [📦 Project Setup](#-project-setup)
- [🗄️ Database Setup](#️-database-setup)
- [🚀 Running the Server](#-running-the-server)
    - [🐳 Docker Setup](#-docker-setup)
- [🔑 Admin Interface](#-admin-interface)
- [📡 API Endpoints](#-api-endpoints)
    - [💳 Validate Transaction](#-validate-transaction)
- [⚙️ Environment Variables](#️-environment-variables)
- [🧪 Testing](#-testing)
- [📝 Notes](#-notes)

---

## 📦 Project Setup

This project was generated using:

```bash
django-admin startproject backend_bank
```

To create a new app (a module within the project), use:

```bash
python manage.py startapp <app_name>
```

---

## 🗄️ Database Setup

To set up the PostgreSQL database for the project, follow these steps:

1. **Install PostgreSQL**
    Ensure PostgreSQL is installed on your system. You can download it from the official website.

2. **Create a Database**
    Create a new database for the project:
    ```sql
    CREATE DATABASE zap_db_bank;
    ```

3. **Configure Database Settings**
    Make sure the variables in `.env` match your PostgreSQL database settings. The `.env` file should contain the following variables:
    ```env
    POSTGRES_DB_BANK
    POSTGRES_USER_BANK
    POSTGRES_PASSWORD_BANK
    POSTGRES_HOST_BANK
    ```
    Default port is 5433


4. **Apply Migrations**
    Run the following commands to apply the database migrations:
    ```bash
    python manage.py migrate
    ```

Now your database is ready to be used with the project!

## 🚀 Running the Server

To start the development server, use the following command:

```bash
python manage.py runserver 8080
```

The server will be available at `http://localhost:8080/`.

## 🔑 Admin Interface

To access the Django admin interface, create a superuser with the following command:

```bash
python manage.py createsuperuser
```

or use the predifined superuser credentials:

```bash
DJANGO_SUPERUSER_USERNAME="admin@example.com" 
DJANGO_SUPERUSER_PASSWORD="SecurePassword1" 
```
	
And execute: 

```bash
python create_superuser.py
```

Then, navigate to `http://localhost:8080/admin/` and log in with the superuser credentials.
You can manage the database models directly from the admin interface.

## 📡 API Endpoints

### 💳 Validate Transaction
**Endpoint:** `POST /api/validate-transaction/`

**Description:** Validates a credit card transaction, ensuring the card exists and the transaction amount does not exceed the limit.

**Request Body:**
```json
{
        "number": "string",
        "owner_name": "string",
        "expiration_date": "MM/YY",
        "cvv": "string",
        "amount": 1000
}
```

**Responses:**
- **200 OK:** The transaction is valid.
    ```json
    {
            "valid": true
    }
    ```
- **403 Forbidden:** The transaction amount exceeds the limit.
    ```json
    {
            "valid": false,
            "message": "Transaction amount exceeds the limit"
    }
    ```
- **400 Bad Request:** The request is invalid.
    ```json
    {
            "error": "string"
    }
    ```

---

## ⚙️ Environment Variables

The following environment variables can be configured for the project:

- `DJANGO_SECRET_KEY`: The secret key for the Django application.
- `DEBUG`: Set to `True` for development or `False` for production.
- `POSTGRES_DB_BANK`: The name of the PostgreSQL database.
- `POSTGRES_USER_BANK`: The PostgreSQL user for the database.
- `POSTGRES_PASSWORD_BANK`: The password for the PostgreSQL user.
- `POSTGRES_HOST_BANK`: The host for the PostgreSQL database.
- `POSTGRES_PORT_BANK`: The port for the PostgreSQL database (default is `5433`).

---

## 🧪 Testing

To run the tests for the project, use the following command:

```bash
python manage.py test
```

This will execute all the test cases and provide a summary of the results.

---

## 📝 Notes

- The transaction limit is currently set to **2000**. You can modify this value in the `views.py` file by changing the `LIMIT` constant.
