# SCHOLA - School Management System

A comprehensive school management platform built with modern technologies. This monorepo contains both the backend API and frontend application.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Test Credentials](#test-credentials)
- [API Documentation](#api-documentation)
- [License](#license)

## 🎯 Overview

SCHOLA is a full-stack school management system designed to streamline administrative tasks, manage student data, track attendance, and facilitate communication between teachers, students, and administrators.

## ✨ Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Teacher, Student)
  - Two-factor authentication (2FA) support

- **Dashboard**
  - Real-time statistics and analytics
  - Weekly attendance charts
  - Quick action shortcuts

- **User Management**
  - Student, Teacher, and Admin profiles
  - Profile settings and customization

- **Settings**
  - Profile management
  - Security settings (password, 2FA)
  - Notification preferences

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT + Express Sessions (for 2FA)
- **Containerization**: Docker

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router 7
- **Styling**: TailwindCSS
- **Icons**: Lucide React

## 📁 Project Structure

```
school_app/
├── school-management-system/          # Backend API
│   ├── app/
│   │   ├── controllers/               # Route handlers
│   │   ├── database/                  # Drizzle ORM schemas
│   │   ├── middlewares/               # Express middlewares
│   │   ├── routes/                    # API routes
│   │   ├── services/                  # Business logic
│   │   └── utils/                     # Utility functions
│   ├── docker-compose.yaml            # Docker configuration
│   └── package.json
│
└── frontend_school_app/
    └── school-management-system-front-end/
        ├── src/
        │   ├── components/            # React components
        │   ├── contexts/              # React contexts (Auth)
        │   ├── libs/                  # API utilities
        │   ├── pages/                 # Page components
        │   └── hooks/                 # Custom hooks
        └── package.json
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Docker** and **Docker Compose**
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/school-management-system.git
cd school-management-system
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd school-management-system

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database credentials

# Start PostgreSQL with Docker
docker-compose up -d

# Run database migrations (if applicable)
npm run db:push

# Start the development server
npm run dev
```

The backend will be running at `http://localhost:3400`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend_school_app/school-management-system-front-end

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running at `http://localhost:5173` (or next available port)

### 4. Database Seeding

Run the following SQL to create test users and permissions:

```sql
-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  description VARCHAR(255),
  permissions_allowed TEXT,
  role_id INTEGER REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default permissions
INSERT INTO permissions (description, permissions_allowed, role_id)
SELECT 'Admin permissions', '["all"]', id FROM roles WHERE name = 'Admin';

INSERT INTO permissions (description, permissions_allowed, role_id)
SELECT 'Teacher permissions', '["view_students", "manage_grades", "view_classes"]', id FROM roles WHERE name = 'Teacher';

INSERT INTO permissions (description, permissions_allowed, role_id)
SELECT 'Student permissions', '["view_own_grades", "view_schedule"]', id FROM roles WHERE name = 'Student';
```

## 🔑 Test Credentials

Use these credentials to log in and test the application:

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Admin   | admin@schola.com    | admin123    |
| Teacher | teacher@schola.com  | teacher123  |
| Student | student@schola.com  | student123  |

## 📖 API Documentation

### Authentication Endpoints

| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | `/api/auth/login`   | User login           |
| POST   | `/api/auth/register`| User registration    |
| POST   | `/api/auth/logout`  | User logout          |
| GET    | `/api/auth/profile` | Get current user     |
| POST   | `/api/auth/verify-2fa` | Verify 2FA code   |

### User Endpoints

| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| GET    | `/api/users`        | List all users       |
| GET    | `/api/users/:id`    | Get user by ID       |
| PUT    | `/api/users/:id`    | Update user          |
| DELETE | `/api/users/:id`    | Delete user          |

## 🔧 Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://postgres:root@localhost:5400/school_ms
MAIL_USER=your-email@example.com
MAIL_PASS=your-email-password
APP_PORT=3400
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by the SCHOLA Team
