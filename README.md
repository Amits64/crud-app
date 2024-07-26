[![ci](https://github.com/Amits64/crud-app/actions/workflows/docker.yml/badge.svg)](https://github.com/Amits64/crud-app/actions/workflows/docker.yml)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Amits64_crud-app&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Amits64_crud-app)
# CRUD Application

## Overview
This project is a CRUD (Create, Read, Update, Delete) application built using Node.js and Express, with a MySQL database for storing user information. The application allows for user registration, login, and management of user data, including role-based access control. It also features logging of database operations and Prometheus metrics for monitoring.

## Features
- **User Registration**: Allows new users to register with a name, email, password, and role.
- **User Login**: Enables existing users to log in using their email and password.
- **User Management**: Supports viewing, updating, and deleting user information.
- **Logging**: Logs all database operations (insert, update, delete) for auditing.
- **Metrics**: Exposes Prometheus metrics for monitoring application performance.
- **Database Management**: View and manage databases and tables.
- **RESTful API**: Provides a RESTful API for all CRUD operations.
- **Static File Serving**: Serves static HTML files for the frontend.

## Technologies Used
- Node.js
- Express
- MySQL
- Prometheus
- Docker
- Jenkins
- SonarQube

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- MySQL
- Docker (for containerization)
- Jenkins (for CI/CD)
- SonarQube (for code quality analysis)

### Installation

1. **Clone the repository**
    ```sh
    git clone https://github.com/Amits64/crud-app.git
    cd crud-app
    ```

2. **Install dependencies**
    ```sh
    npm install
    ```

3. **Set up environment variables**
    Create a `.env` file in the root directory and add the following:
    ```env
    PORT=3000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=yourpassword
    DB_NAME=accounts
    ```

4. **Run the application**
    ```sh
    npm start
    ```

### Database Setup

1. **Create a MySQL database**
    ```sql
    CREATE DATABASE accounts;
    ```

2. **Create a users table**
    ```sql
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL
    );
    ```

3. **Create a logs table**
    ```sql
    CREATE TABLE logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        operation VARCHAR(50) NOT NULL,
        table_name VARCHAR(50) NOT NULL,
        data TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```

### Usage

1. **Register a new user**
    ```sh
    curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d '{
        "name": "John Doe",
        "email": "john.doe@example.com",
        "password": "password123",
        "role": "user"
    }'
    ```

2. **Login a user**
    ```sh
    curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{
        "email": "john.doe@example.com",
        "password": "password123"
    }'
    ```

3. **Get user by ID**
    ```sh
    curl http://localhost:3000/user/1
    ```

4. **Update user information**
    ```sh
    curl -X PUT http://localhost:3000/user/1 -H "Content-Type: application/json" -d '{
        "name": "John Smith",
        "email": "john.smith@example.com",
        "role": "admin"
    }'
    ```

5. **Delete a user**
    ```sh
    curl -X DELETE http://localhost:3000/user/1
    ```

### Prometheus Metrics
Access Prometheus metrics at [http://localhost:3000/metrics](http://localhost:3000/metrics).

### Docker
Build and run the application using Docker.
```sh
docker build -t crud-app .
docker run -p 3000:3000 -d crud-app

