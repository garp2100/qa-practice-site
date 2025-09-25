# QA Practice Site – Monorepo Starter

Fullstack app for practicing Playwright + Cucumber with SQL.

### pgAdmin 
- URL: http://localhost:5050/

#### Credentials

| Username          | Password |
|-------------------|----------|
| admin@example.com | admin    |

### API Endpoint Map
#### Health Check
-Method/Path: `GET /api/health`<br>
-Headers: `none`<br>
-Body: `none`<br>
-Response: `{ "ok": true, "db": true }`

#### Register
-Method/Path: `POST /api/auth/register`<br>
-Headers: `Content-Type: application/json`<br>
-Body (JSON): `{ "email": "user@example.com", "password": "password123 }"`<br>
-Response (on success): `{ "id": 1, "email": "user@example.com" }`

#### Login
-Method/Path: `POST /api/auth/login`<br>
-Headers: `Content-Type: application/json`<br>
-Body (JSON): `{ "email": "user@example.com", "password": "password123" }`<br>
-Response (on success): `{ "token": "eyJhbGciOiJI..." }`<br>
-Response (on failure): `{ "error": "Invalid login credentials" }`

#### Get Current User
-Method/Path: `GET /api/users/me`<br>
-Headers: `Authorization: Bearer <token>`<br>
-Body: `none`<br>
-Response (on success): `{ "id": 1, "user@example.com", "created_at": "2025-09-23T12:00:00Z" }`<br>
-Response (on failure, missing/invalid token): `{ "error": "missing auth header/invalid token" }`



