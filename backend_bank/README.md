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
    CREATE DATABASE backend_bank;
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
    python manage.py makemigrations
    python manage.py migrate
    ```

5. **Verify the Setup**
    Use the following command to check if the database is connected and functioning correctly:
    ```bash
    python manage.py dbshell
    ```

Now your database is ready to be used with the project!

## 🚀 Running the Server

To start the development server, use the following command:

```bash
python manage.py runserver 8080
```

The server will be available at `http://127.0.0.1:8080/`.

### 🐳 Docker Setup

To run the project using Docker, follow these steps:

1. Build the Docker image:
     ```bash
     docker build -t backend_bank .
     ```
2. Run the Docker container:
     ```bash
    docker run -it --rm \
    -v $(pwd)/backend_bank:/app \
    -w /app \
    -e DJANGO_SETTINGS_MODULE=backend_bank.settings \
    -e POSTGRES_DB=bank_db \
    -e POSTGRES_USER=bank_user \
    -e POSTGRES_PASSWORD=bank_pass \
    -e POSTGRES_HOST=postgres \
    -e POSTGRES_PORT=5432 \
    --network bank_network \
    --name backend_bank_container \
    backend_bank_image \
    python manage.py runserver 0.0.0.0:8000
    ```
3. Access the application at `http://localhost:8080/`.
4. To stop the container, use:
    ```bash
    docker stop backend_bank_container
    ```
---

## 🔑 Admin Interface

To access the Django admin interface, create a superuser with the following command:

```bash
python manage.py createsuperuser
```

Then, navigate to `http://127.0.0.1:8080/admin/` and log in with the superuser credentials.
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
- `DATABASE_URL`: The database connection string.
- `DEBUG`: Set to `True` for development or `False` for production.

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
