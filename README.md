# Simple Auth System

A simple and secure user authentication system built with a modern tech stack: FastAPI, React, and MySQL. This project provides a solid foundation for applications requiring user registration, login, and email verification.

## Tech Stack

-   **Backend:** FastAPI, SQLAlchemy, MySQL, Uvicorn
-   **Frontend:** React, Axios, React Router
-   **Security:** JWT， password hashing.
-   **Database:** MySQL

---

## Getting Started

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Backend Setup:**
    ```bash
    # Navigate to the backend directory
    cd backend

    # Create a virtual environment and activate it
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

    # Install dependencies
    pip install -r requirements.txt
    ```

3.  **Frontend Setup:**
    ```bash
    # Navigate to the frontend directory
    cd ../frontend

    # Install dependencies
    npm install
    # or
    yarn install
    ```

4.  **Database and Environment Configuration:**
    -   Ensure your MySQL server is running. Create a database for the project:
        ```sql
        CREATE DATABASE auth_db;
        ```
        
    -   Edit the `.env` file with your specific credentials:
        ```env
        # Database
        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=your_mysql_password
        DB_NAME=auth_db

        # JWT
        SECRET_KEY=your_super_secret_key_for_jwt
        ALGORITHM=HS256
        ACCESS_TOKEN_EXPIRE_MINUTES=30

        # Email Verification (using Gmail as an example)
        # Note: Find SMTP server like Brevo、SendGrid、Amazon SES、Mailgun or Postmark
        MAIL_USERNAME=your_email@gmail.com
        MAIL_PASSWORD=your_google_app_password
        MAIL_FROM=your_email@gmail.com
        MAIL_PORT=587
        MAIL_SERVER=smtp.gmail.com
        ```

### Running the Application

1.  **Run the Backend Server:**
    -   Make sure you are in the `backend/` directory with the virtual environment activated.
    -   FastAPI will automatically create the database tables on startup (if configured in the code).
    ```bash
    fastapi dev main.py
    ```
    The backend will be available at `http://127.0.0.1:8000`.

2.  **Run the Frontend Development Server:**
    -   In a new terminal, navigate to the `frontend/` directory.
    ```bash
    npm start
    # or
    yarn start
    ```
    The React application will be available at `http://localhost:3000`.

---

## API Endpoints

A brief overview of the core API endpoints.

| Method | Endpoint                | Description                            | Auth Required |
| :----- | :---------------------- | :------------------------------------- | :------------ |
| `POST` | `/api/auth/register`    | Register a new user.                   | No            |
| `POST` | `/api/auth/login`       | Authenticate a user and get a JWT.     | No            |
| `GET`  | `/api/auth/verifyemail` | Verify user's email via token.         | No            |
| `GET`  | `/api/users/me`         | Get the current authenticated user's data. | Yes           |
