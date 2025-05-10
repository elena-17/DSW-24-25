# ZAP Frontend 🚀

This project is the frontend for the ZAP application, built with Angular. It provides a user interface for managing transactions, user accounts, and administrative features.

## Table of Contents 📋

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Technologies Used](#technologies-used)

---

## Prerequisites ✅

Before starting, make sure you have the following installed:

- [Angular CLI](https://angular.io/cli) (version 19.2)
- [Node.js](https://nodejs.org/) (version 22.14)

---

## Installation 📦

1. Install the dependencies:
   ```bash
   npm install
   ```

## Running the Project ▶️

Before running the project, ensure that the backend server is running. After that, you can run the frontend application:

1. Start the development server:
   ```bash
   ng serve
   ```
2. Open your browser and navigate to `http://localhost:4200/`.
3. The application should be running and you can start using it.

## Project Structure 🗂️

     ```
     frontend
     ├── src
     │   ├── app
     │   │   ├── admin-accounts/
     |   │   ├── admin-users/
     |   │   ├── error404/             # 404 error page
     |   │   ├── friends/              # Module for managing favorite relationships
     |   │   ├── helppage/
     |   │   ├── homepage/
     |   │   ├── interceptors/         # HTTP interceptors for setting auth token
     |   │   ├── login/
     |   │   ├── profile-page/         # Profile page and manage creditcards
     |   │   ├── register/
     |   │   ├── services/             # Services for API calls and data management
     |   │   ├── shared/               # Shared components: badge, slider, confirm dialog and table
     |   |   ├── toolbar/              # Toolbar component for navigation
     |   |   ├── transactions/
     |   │   ├── app.component.ts      # Main application component
     |   │   ├── app.routes.ts         # Application routes configuration
     |   │   ├── material.module.ts    # Angular Material configuration
     │   └── ...
     ├── assets/                       # Static assets like images and themes
     │   └── zap-logo.png              # Application logo
     ├── environments/
     |   ├── environment.ts            # Development environment configuration
     │   └── environment.prod.ts       # Production environment configuration
     ├── styles.scss                   # Global application styles
     └── index.html                    # Main HTML file
     ```

## Available Scripts 📜

In the `package.json` file, you can find the following scripts:

- `ng serve`: Starts the development server.
- `ng build`: Builds the application for production.

## Technologies Used 💻

- Angular: Frontend framework for building the application.
- Angular Material: UI component library for Angular.
- RxJS: Library for reactive programming using observables.
- TypeScript: Superset of JavaScript for building large applications.
