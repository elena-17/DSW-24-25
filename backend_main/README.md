# BACKEND MAIN 🚀

This is the backend for the DSW-24-25 project, built with Django. It provides APIs for managing transactions, user accounts, friendships, and credit card operations. The backend also integrates with external services like Mercure for real-time notifications and Stripe for payment processing. For authentication, it uses JWT (JSON Web Tokens) to secure API endpoints and email confirmation.

## Table of Contents 📚
- [Project Overview](#project-overview)
- [Folder Structure](#folder-structure)
- [Setup and Installation](#setup-and-installation)
- [Running the Server](#running-the-server)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Dependencies](#dependencies)

---

## Project Overview 🌟

This backend is designed to handle:
- 🧑‍💻 User authentication and account management.
- 💸 Transactions (sending, receiving, and requesting money).
- 🔔 Real-time notifications using Mercure.
- 💳 Credit card validation and operations.
- 🤝 Friendships and favorite users.

This is the backend for the DSW-24-25 project, built with Django. It provides APIs for managing transactions, user accounts, friendships, and credit card operations. The backend also integrates with external services like Mercure for real-time notifications and Stripe for payment processing. For authentication, it uses JWT (JSON Web Tokens) to secure API endpoints and email confirmation.


## Table of Contents
- [Project Overview](#project-overview)
- [Folder Structure](#folder-structure)
- [Setup and Installation](#setup-and-installation)
- [Running the Server](#running-the-server)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Dependencies](#dependencies)


---

## Project Overview

This backend is designed to handle:
- User authentication and account management.
- Transactions (sending, receiving, and requesting money).
- Real-time notifications using Mercure.
- Credit card validation and operations.
- Friendships and favorite users.

This project was generated using:

```bash
django-admin startproject backend_main
```

---

## Folder Structure

```
    backend_main/
    ├── account/               # Handles user account-related logic
    ├── backend_main/          # Main Django project directory
    ├── blocks/                # Handles blocked users
    ├── creditcard/            # Handles credit card-related logic
    ├── dashboard/             # Handles dashboard-related and statistics
    ├── friendships/           # Handles friendships and favorite users
    ├── healthz/               # Health check endpoint
    ├── mercure/               # Handles Mercure real-time notifications
    ├── transactions/          # Handles transactions logic
    ├── users/                 # Handles user-related logic
    ├── create_superuser.py    # Script to create a superuser
    ├── Dockerfile             # Dockerfile for building the image
    ├── entrypoint.sh          # Entrypoint script for Docker
    ├── manage.py              # Django's command-line utility
    ├── requirements.txt       # Python dependencies
    └── README.md              # Project documentation
```

---


## Setup and Installation

### Prerequisites
- Python 3.12 or higher
- PostgreSQL
- Django 4.2 or higher
- Brevo credentials (for email sending)
- Stripe credentials (for payment processing)

All the dependencies are in the `requirements.txt` file.

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/elena/DSW-24-25.git
   cd backend_main
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up the database:
   ```bash
   python manage.py migrate
   ```

5. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```
   or run the script `create_superuser.py` to create a superuser with default credentials.

---

## Running the Server

To start the development server, run:

```bash
python manage.py runserver
```

The server will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

Also, it needs Mercure and PostgreSQL to be running. You can run Mercure using Docker:

```bash
docker run -d --name zap-mercure -e SERVER_NAME=":80" -e MERCURE_PUBLISHER_JWT_KEY="<BACKEND FIELD ENCRYPTION KEY>"  -e MERCURE_SUBSCRIBER_JWT_KEY="<BACKEND FIELD ENCRYPTION KEY>"   -p 3000:80 -v mercure_data:/data -v mercure_config:/config dunglas/mercure:v0.18  /usr/bin/caddy run –config /etc/caddy/dev.Caddyfile 
```

Run PostgreSQL using Docker:

```bash
docker run -d -p 5432:5432 --name postgres -e POSTGRES_USER=your_user -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=your_db postgres:14.17
```

## Environment Variables

The following environment variables are required for the project:

- `SECRET_KEY_BACKEND`: Django's secret key.
- `DEBUG_BANK`: Set to `True` for development or `False` for production.
- `DEBUG_BACKEND`: PostgreSQL connection string.
- `BANK_BASE_URL`: URL for the bank API.
- `FIELD_ENCRYPTION_KEY`: Key for encrypting sensitive fields.
- `FRONTEND_BASE_URL`: URL of the frontend application.
- `POSTGRES_DB_MAIN`: Name of the PostgreSQL database.
- `POSTGRES_USER_MAIN`: PostgreSQL username.
- `POSTGRES_PASSWORD_MAIN`: PostgreSQL password.
- `POSTGRES_HOST`: PostgreSQL host (usually `localhost`).
- `POSTGRES_PORT`: PostgreSQL port (usually `5432`).
- `EMAIL_HOST_USER`: Email address for sending emails.
- `EMAIL_HOST_PASSWORD`: Password for the email address.
- `DEFAULT_FROM_EMAIL`: Default sender email address.
- `SECRET_KEY_STRIPE`: Secret key for Stripe API.
- `MERCURE_URL`: URL for the Mercure server.

You can define these variables in a `.env` file in the root directory.

---

## Testing

To run tests, use the following command:

```bash
python manage.py test
```

Coverage reports can be generated using:

```bash
coverage run manage.py test
coverage report
```
