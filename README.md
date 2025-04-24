<div align="center">
    <picture>
        <img alt="App logo" src="./frontend/src/assets/zap-logo.png" width="full">
    </picture>
</div>


[![Django Tests Backend Main](https://github.com/elena-17/DSW-24-25/actions/workflows/django-tests.yml/badge.svg)](https://github.com/elena-17/DSW-24-25/actions/workflows/django-tests.yml)

<h1 align="center">Zap</h1>
A web application for managing transactions and friendships, built with Django and Angular.

---

## 📂 Project Structure

```
📂 .
    ├── 📂 backend_bank
    ├── 📂 backend_main
    ├── 📂 frontend
    ├── 📄 .env
    ├── 📄 .gitignore
    ├── 📄 .pre-commit-config.yaml
    ├── 📄 docker-compose.yml
    └── 📄 README.md
```

- **`backend_bank`** 🏦: Contains the credit card backend to simulate a bank.
- **`backend_main`** 🔧: Contains the main backend with core functionality for the application.
- **`frontend`** 🌐: Contains the Angular frontend application .

---

## 🚀 Features

- 💸 **Transactions**: Send and request money to other people seamlessly. Imagine you go out with your friends, now dividing the bill it's a piece of cake!
- 🔔 **Real-Time Notifications**: Receive real-time money requests.
- 🛡️ **Secure Authentication**: Powered by JWT for secure API access.
- 🏦 **Credit Card Validation**: Simulate bank operations with `backend_bank` or select Stripe module.
- 🤝 **Friendships**: Manage favorite and blocked users.
- 📧 **Email Confirmation**: Secure your account with email verification.
- 💳 **Store credit card**: You don't need to remember all your credit cards details if you are using our bank, just your CVV.

---

## 🐋 Run with Docker (TODO)

### Prerequisites

1. Install **Docker** and **Docker Compose**.

### Steps

1. Clone the repository:
    ```bash
    git clone https://github.com/elena/DSW-24-25.git
    cd DSW-24-25
    ```

2. Set up the environment variables:
    - Copy the `.env.example` file to `.env` and update the values as needed.

3. Build and start the application using Docker Compose:
    ```bash
    docker-compose up -d
    ```

4. Access the application:
    - Frontend: `http://localhost:4200`
    - Backend: `http://localhost:8000`
    - Bank: `http://localhost:8080`


## 🧹 Code Quality with Pre-Commit

Ensure consistent code formatting and linting with `pre-commit`.

1. Install `pre-commit`:
   ```bash
   pip install pre-commit
   ```

2. Install hooks:
   ```bash
   pre-commit install
   ```

3. Run checks:
   ```bash
   pre-commit run --all-files
   ```

---


## 🧪 Testing

Run tests for the backend:

```bash
python manage.py test
```

Run tests for the frontend:

```bash
ng test
```

---


## 📦 Technologies Used

- **Backend**: Django, Django REST Framework, PostgreSQL
- **Frontend**: Angular, Angular Material
- **Authentication**: JWT (JSON Web Tokens)
- **Real-Time Notifications**: Mercure

---
