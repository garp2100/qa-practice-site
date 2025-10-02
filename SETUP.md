# QA Practice Site - Setup Guide

A full-stack practice site for UI automation testing with Playwright and Cucumber.

## Features

- **Authentication**: Register/login/logout with JWT tokens
- **CRUD Operations**: Create, read, update, delete items with SQL backend
- **Automation-Ready**: All UI elements tagged with `data-automation-id` attributes
- **Dual Deployment**: Runs locally via Docker or in production on GCP Cloud Run + Firebase

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript
- **Backend**: Express + Node.js + TypeScript
- **Database**: PostgreSQL 16
- **Authentication**: JWT + bcrypt
- **Deployment**:
  - Client: Firebase Hosting
  - API: GCP Cloud Run
  - Database: GCP Cloud SQL
  - CI/CD: CircleCI

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop
- Git

### Local Development (Docker)

1. **Clone the repository**
   ```bash
   git clone https://github.com/garp2100/qa-practice-site
   cd qa-practice-site
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```

3. **Start with Docker**
   ```bash
   npm run docker:dev
   ```

   This will:
   - Build the Docker image with both client and server
   - Start PostgreSQL (port 5432)
   - Start pgAdmin (port 5050)
   - Start the app (port 8081)

4. **Access the application**
   - App: http://localhost:8081
   - pgAdmin: http://localhost:5050 (admin@example.com / admin)

### Local Development (No Docker)

1. **Start database containers**
   ```bash
   npm run docker:up
   ```

2. **Run server**
   ```bash
   npm run dev:server
   ```
   Server runs at http://localhost:4001

3. **Run client** (in a new terminal)
   ```bash
   npm run dev:client
   ```
   Client runs at http://localhost:5173

---

## Docker Commands

- `npm run docker:dev` - Build and start all containers (postgres, pgadmin, app)
- `npm run docker:down` - Stop and remove all containers
- `npm run docker:restart` - Restart only the app container (keeps DB running)
- `npm run docker:up` - Start postgres and pgadmin containers only

## Development Commands

- `npm run dev` - Run server + client in dev mode (no Docker)
- `npm run dev:server` - Run only server in dev mode
- `npm run dev:client` - Run only client in dev mode
- `npm run build` - Build both server and client
- `npm run build:server` - Build server only
- `npm run build:client` - Build client only

---

## Environment Variables

### Server (.env files in `server/`)

**`.env.local`** (local development):
```env
DATABASE_URL=postgres://app:app@localhost:5432/appdb
NODE_ENV=development
PORT=4001
JWT_SECRET=<your-secret>
CORS_ORIGIN=http://localhost:5173
```

**`.env.docker`** (Docker development):
```env
DATABASE_URL=postgres://app:app@local-postgres:5432/appdb
NODE_ENV=production
PORT=8080
JWT_SECRET=<your-secret>
CORS_ORIGIN=http://localhost:5173,http://localhost:8081
```

**`.env.production`** (GCP Cloud Run):
```env
NODE_ENV=production
PORT=8080
DATABASE_URL=postgres://app:app@/appdb?host=/cloudsql/<instance-connection-name>
JWT_SECRET=<your-secret>
CORS_ORIGIN=https://qa-practice-client.web.app,http://localhost:5173,http://localhost:5174
```

### Client (.env files in `client/`)

**`.env.local`** (local development):
```env
VITE_API_BASE=http://localhost:4001
VITE_ENV=local
```

**`.env.docker`** (Docker development):
```env
VITE_API_BASE=http://localhost:8081
VITE_ENV=docker
```

**`.env.production`** (Firebase hosting):
```env
VITE_API_BASE=https://qa-practice-api-epg4itpx4a-uc.a.run.app
VITE_ENV=production
```

---

## Database Schema

The schema is automatically applied on server startup via `server/src/schema.sql`:

```sql
create table if not exists users (
    id serial primary key,
    email varchar(255) unique not null,
    password_hash varchar(255) not null,
    created_at timestamp default now()
);

create table if not exists items (
    id serial primary key,
    owner_id integer not null references users(id) on delete cascade,
    name varchar(255) not null,
    done boolean default false,
    created_at timestamp default now()
);
```

---

## API Endpoints

### Health Check
- **Method/Path**: `GET /api/health`
- **Headers**: `none`
- **Response**: `{ "ok": true, "db": true }`

### Register
- **Method/Path**: `POST /api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body**: `{ "email": "user@example.com", "password": "password123" }`
- **Response**: `{ "id": 1, "email": "user@example.com", "token": "..." }`

### Login
- **Method/Path**: `POST /api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**: `{ "email": "user@example.com", "password": "password123" }`
- **Response**: `{ "token": "eyJhbGciOiJI..." }`

### Get Current User
- **Method/Path**: `GET /api/users/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "id": 1, "email": "user@example.com", "created_at": "2025-09-23T12:00:00Z" }`

### Get Items
- **Method/Path**: `GET /api/items`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `[{ "id": 1, "owner_id": 1, "name": "Test Item", "done": false, "created_at": "..." }]`

### Create Item
- **Method/Path**: `POST /api/items`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body**: `{ "name": "New Item" }`
- **Response**: `{ "id": 2, "owner_id": 1, "name": "New Item", "done": false, "created_at": "..." }`

### Update Item
- **Method/Path**: `PATCH /api/items/:id`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body**: `{ "done": true }`
- **Response**: `{ "id": 2, "owner_id": 1, "name": "New Item", "done": true, "created_at": "..." }`

### Delete Item
- **Method/Path**: `DELETE /api/items/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "ok": true }`

---

## Production Deployment

### Firebase (Client)

1. Build the client:
   ```bash
   cd client
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ```

   Live at: https://qa-practice-client.web.app

### GCP Cloud Run (API)

Deployment is automated via CircleCI on push to `main` branch.

**Manual deployment**:
1. Build Docker image from root:
   ```bash
   docker build -t qa-practice-site:latest .
   ```

2. Deploy to Cloud Run (handled by CircleCI):
   - Builds multi-platform image (linux/amd64)
   - Pushes to GCP Artifact Registry
   - Deploys to Cloud Run with Cloud SQL connection

### Cloud SQL Database

The production database password must be set:
```bash
gcloud sql users set-password app \
  --instance=qa-practice-sql \
  --password=app
```

---

## Automation Testing

All interactive elements include `data-automation-id` attributes for easy selection in Playwright/Cucumber tests:

### Login Form
- `login-form` - Form container
- `login-email` - Email input
- `login-password` - Password input
- `login-submit` - Submit button
- `login-error` - Error message

### Register Form
- `register-form` - Form container
- `register-email` - Email input
- `register-password` - Password input
- `register-submit` - Submit button
- `register-success` - Success message

### Main App
- `title` - Page title
- `welcome` - Welcome message
- `logout-btn` - Logout button

### Items
- `items` - Items container
- `item-input` - Add item input
- `item-add` - Add item button
- `item-${id}` - Individual item container
- `item-toggle-${id}` - Item checkbox
- `item-name-${id}` - Item name text
- `item-delete-${id}` - Delete button

---

## Troubleshooting

### Docker containers won't start
```bash
# Clean up and restart
npm run docker:down
docker system prune -f
npm run docker:dev
```

### Database connection errors
- Verify PostgreSQL is running: `docker ps | grep postgres`
- Check connection string in `.env` files
- For Cloud SQL: Verify user password is set correctly

### CORS errors
- Local: Ensure `CORS_ORIGIN` in `server/.env.docker` includes your origin
- Production: Update `cloudrun.env.yaml` and redeploy to Cloud Run

### Port conflicts
- Check if ports 4001, 5173, 5432, 5050, 8081 are available
- Stop conflicting services or change ports in `.env` files

---

## Project Structure

```
qa-practice-site/
├── .circleci/          # CircleCI CI/CD configuration
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── api.ts     # API client
│   │   └── App.tsx    # Main app
│   ├── .env.local     # Local dev config
│   ├── .env.docker    # Docker dev config
│   ├── .env.production # Production config
│   └── package.json
├── server/             # Express backend
│   ├── src/
│   │   ├── index.ts   # Server entry
│   │   ├── routes.ts  # API routes
│   │   ├── auth.ts    # Auth logic
│   │   ├── db.ts      # Database client
│   │   └── schema.sql # Database schema
│   ├── .env.local     # Local dev config
│   ├── .env.docker    # Docker dev config
│   ├── .env.production # Production config
│   └── package.json
├── Dockerfile          # Multi-stage build
├── .dockerignore       # Docker ignore patterns
├── cloudrun.env.yaml   # Cloud Run env vars
└── package.json        # Root package.json
```
