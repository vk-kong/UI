# Kong Deploy Backend API

Backend API for Kong Deploy UI with PostgreSQL authentication.

## Features

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes
- PostgreSQL database integration

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kong_deploy_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key
```

### 3. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE kong_deploy_db;
CREATE USER kong_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE kong_deploy_db TO kong_user;
\q
```

### 4. Run Database Migrations

```bash
npm run migrate
```

### 5. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "username": "testuser",
    "password": "password123"
  }
  ```

- `GET /api/auth/me` - Get current user (requires authentication)
  ```
  Headers: Authorization: Bearer <token>
  ```

### Health Check

- `GET /health` - Server health check

## Testing

### Register a user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Get current user:
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <your_token>"
```

## Project Structure

```
backend/
├── config/
│   └── database.js          # PostgreSQL connection pool
├── controllers/
│   └── authController.js    # Authentication logic
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── migrations/
│   ├── 001_create_users_table.sql
│   └── run.js               # Migration runner
├── models/
│   └── User.js              # User model
├── routes/
│   └── auth.js              # Authentication routes
├── utils/
│   └── password.js          # Password hashing utilities
├── server.js                # Express server
└── package.json
```

## Security Notes

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Consider adding rate limiting
- Implement password complexity requirements
- Use environment variables for all secrets

