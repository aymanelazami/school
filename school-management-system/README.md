# SCHOLA Backend API

The backend API for the SCHOLA School Management System.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT + Express Sessions

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- Docker and Docker Compose

### Installation

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env

# Start PostgreSQL
docker-compose up -d

# Start development server
npm run dev
```

Server runs at `http://localhost:3400`

## 📁 Structure

```
app/
├── controllers/     # Route handlers
├── database/        # Drizzle ORM schemas
├── middlewares/     # Express middlewares
├── routes/          # API routes
├── services/        # Business logic
├── scripts/         # SQL scripts
└── utils/           # Utilities
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get profile
- `POST /api/auth/verify-2fa` - Verify 2FA

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🔧 Scripts

```bash
npm run dev        # Development with hot reload
npm run build      # Build for production
npm run start      # Start production server
npm run db:push    # Push schema to database
npm run db:studio  # Open Drizzle Studio
```

## 📄 Environment Variables

See `.env.example` for required variables.