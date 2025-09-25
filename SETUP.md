# QA Practice Site --- Setup Guide

full-stack practice site: 
- Auth
(register/login/logout with JWT) 
- SQL-backed CRUD items 
- React frontend with automation IDs for UI automation practice.

------------------------------------------------------------------------

## Step 1 --- Backend & Database Setup

### 1. Start Postgres (Docker)

Run from project root:

``` bash
  docker compose up -d
```

This will start: - Postgres at `localhost:5432` (user: `app`, pass:
`app`, db: `appdb`) - pgAdmin at `http://localhost:5050` (login:
`admin@example.com` / `admin`).

### 2. Database Schema

**server/src/schema.sql**

``` sql
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

### 3. Database Utility

**server/src/db.ts**

``` ts
import dotenv from 'dotenv';
dotenv.config();
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool, QueryResult, QueryResultRow } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function initDb(): Promise<void> {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
}

export async function query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: any[]
): Promise<QueryResult<T>> {
    return pool.query<T>(text, params);
}
```

### 4. Server Entry

**server/src/index.ts**

``` ts
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDb, query } from './db.js';
import routes from "./routes.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));

app.use('/api', routes);

// Health check endpoint
app.get('/api/health', async (_req, res) => {
    try {
        const { rows } = await query<{ ok: number }>('select 1 as ok');
        res.json({ ok: true, db: rows[0].ok === 1 });
    } catch (e: any) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

const port = Number(process.env.PORT || 4000);

(async () => {
    await initDb();
    app.listen(port, () => console.log(`[Server] listening on http://localhost:${port}`));
})();
```

------------------------------------------------------------------------

## Step 2 --- Auth APIs

### 1. Auth Logic

**server/src/auth.ts**

``` ts
// Handles hashing passwords, verifying, and issuing JWTs.
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './db.js';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function register(email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    await query('insert into users (email, password_hash) values ($1, $2) on conflict (email) do nothing', [email, hash]);
    const { rows } = await query('select id, email from users where email = $1', [email]);
    return rows[0];
}

export async function login(email: string, password: string) {
    const { rows } = await query('select id, email, password_hash from users where email = $1', [email]);
    const user = rows[0];
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return null;

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
    return token; // raw string, not { token }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'missing auth header' });
    const token = auth.replace('Bearer ', '').trim();
    try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        (req as any).userId = payload.sub;
        next();
    } catch { return res.status(401).json({ error: 'invalid token' }); }
}
```

### 2. Routes (with auth + health)

**server/src/routes.ts**

``` ts
// File to wire endpoints.
import { Router } from 'express';
import { register, login, authMiddleware} from './auth.js';
import { query } from './db.js';
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Health
router.get('/health', async (req, res) => {
    const { rows } = await query('select 1 as ok');
    res.json({ ok: true, db: rows[0].ok === 1 });
});

// Auth
router.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send('Email and password is required');
    const user = await register(email, password);

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ id: user.id, email: user.email, token });
});

router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const token = await login(email, password);
    if (!token) return res.status(400).send('Invalid login credentials');
    res.json({ token }); // sends raw string as JSON
});

// Protected route example
router.get('/users/me', authMiddleware, async (req, res) => {
    const userId = (req as any).userId;
    const { rows } = await query('select id, email, created_at from users where id=$1', [userId]);
    res.json(rows[0]);
});

// Items Crud
router.get('/items', authMiddleware, async (req, res) => {
    const userId = (req as any).userId;
    const { rows } = await query('select * from items where owner_id=$1 order by id desc', [userId]);
    res.json(rows);
});

router.post('/items', authMiddleware, async (req, res) => {
    const userId = (req as any).userId;
    const { name } = req.body;
    const { rows } = await query(
        'insert into items (owner_id, name) values ($1, $2) returning *',
        [userId, name]
    );
    res.json(rows[0]);
});

router.patch('/items/:id', authMiddleware, async (req, res) => {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { done } = req.body;
    const { rows } = await query(
        'update items set done=$1 where id=$2 and owner_id=$3 returning *',
        [done, id, userId]
    );
    res.json(rows[0]);
});

router.delete('/items/:id', authMiddleware, async (req, res) => {
    const userId = (req as any).userId;
    const { id } = req.params;
    await query(
        'delete from items where id=$1 and owner_id=$2', [id, userId]
    );
    res.json({ ok: true });
})

export default router;
```

Add `.env` in `server/`:

    PORT=4000
    DATABASE_URL=postgres://app:app@localhost:5432/appdb
    JWT_SECRET=dev_secret_change_me
    CORS_ORIGIN=http://localhost:5173

Run the server:

``` bash
cd server
npm install
npm run dev
```

Test APIs with curl/Postman: - Register: `POST /api/auth/register` -
Login: `POST /api/auth/login` - Protected: `GET /api/users/me`

------------------------------------------------------------------------

## Step 3 --- React Client (Login & Register)

### 1. API Helper

**client/src/api.ts**

``` ts
// client/src/api.ts
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function api(path: string, opts: RequestInit = {}) {
    // grab token from localStorage
    const token = localStorage.getItem("token");

    // set headers
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(opts.headers as any),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // call backend
    const res = await fetch(`${BASE}/api${path}`, { ...opts, headers });

    // error handling
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }

    // assume JSON response
    return res.json();
}
```

### 2. Main App

**client/src/App.tsx**

``` tsx
import React, { useEffect, useState } from 'react';
import { api } from './api.js';
import LoginForm from './components/LoginForm.tsx';
import RegisterForm from './components/RegisterForm.tsx';
import Items from './components/Items.tsx';

export default function App() {
    const [me, setMe] = useState<any>(null);

    async function loadMe(){
        try {
            const data = await api('/users/me');
            setMe(data);
        } catch { setMe(null); }
    }

    useEffect(() => { loadMe(); }, []);

    return (
        <div className="App">
            <h1 data-automation-id="title">QA Practice Site</h1>
            {!me ? (
                <>
                    <LoginForm onSuccess={loadMe} />
                    <hr />
                    <RegisterForm onSuccess={loadMe} />
                </>
                ) : (
                    <>
                        <p data-automation-id="welcome">Welcome {me.email}</p>
                        <button
                            data-automation-id="logout-btn"
                            onClick={() => { localStorage.removeItem('token'); setMe(null); }}>
                            Logout
                        </button>
                        <Items />
                    </>
                )}
        </div>
    )
}
```

### 3. Login Form

**client/src/components/LoginForm.tsx**

``` tsx
import React, { useState } from 'react';
import { api } from '../api';

export default function LoginForm({ onSuccess }: { onSuccess:() => void }) {
    const [email, setEmail] = useState('user@example.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        try {
            // Call backend login
            const response = await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            console.log("Login response:", response);

            // Handle both string and object responses
            const token = typeof response === 'string' ? response : response.token;

            if (!token) {
                throw new Error("No token received from server");
            }

            console.log("Storing token:", token);
            localStorage.setItem('token', token);

            // Tell App.tsx to reload user
            onSuccess();
        } catch (err) {
            console.error("Login error:", err);
            setError('Login failed');
        }
    }

    return (
      <form onSubmit={submit} data-automation-id ="login-form">
          <h2>Login</h2>
          <label>Email
              <input data-automation-id ="login-email" value={email} onChange={e=> setEmail(e.target.value)} />
          </label>
          <label>Password
            <input data-automation-id="login-password" value={password} onChange={e=> setPassword(e.target.value)} />
          </label>
          <button data-automation-id ="login-submit" type="submit">Sign in</button>
          {error && <p data-automation-id="login-error">{error}</p>}
      </form>
    );
}

```

### 4. Register Form

**client/src/components/RegisterForm.tsx**

``` tsx
import React, { useState } from 'react';
import { api } from '../api';

export default function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
    const [email, setEmail] = useState('newuser@example.com');
    const [password, setPassword] = useState('password');
    const [msg, setMsg] = useState('');

    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const response = await api('/auth/register', { method: 'POST', body: JSON.stringify({ email, password })});
        if (response.token) {
            localStorage.setItem('token', response.token);
        }
        setMsg('Registered! now log in.');
        onSuccess();
    }

    return (
      <form onSubmit={submit} data-automation-id="register-form">
          <h2>Register</h2>
          <label>Email
              <input data-automation-id="register-email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>Password
              <input data-automation-id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button data-automation-id="register-submit" type="submit">Create account</button>
          {msg && <p data-automation-id="register-success">{msg}</p>}
      </form>
    );
}
```

Run client:

``` bash
  cd client
  npm install
  npm run dev
```

Visit <http://localhost:5173>.<br><br>
Refer to the [README.md](README.md) for all operations you can do on the site.

------------------------------------------------------------------------

## Step 4 --- CRUD Items UI

### Items Component

**client/src/components/Items.tsx**

``` tsx
import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Items() {
    const [items, setItems] = useState<any[]>([]);
    const [name, setName] = useState('');

    async function load(){
        const data = await api('/items');
        setItems(data);
    }

    async function add(){
        if (!name) return;
        await api('/items', {method: 'POST', body: JSON.stringify({ name })});
        setName('');
        await load();
    }

    async function toggle(id:number, done:boolean){
        await api(`/items/${id}`, { method: 'POST', body: JSON.stringify({ done }) });
        await load();
    }

    async function remove(id:number){
        await api(`/items/${id}`, { method: 'DELETE' });
        await load();
    }

    useEffect(() => { load(); },[]);

    return (
        <div data-automation-id="items">
            <h2>Items</h2>
            <input
                data-automation-id="item-input"
                value={name}
                onChange={(e => setName(e.target.value) )}
                placeholder="Add item"
            />
            <button data-automation-id="item-add" onClick={add}>Add</button>
            <div>
                {items.map(it => (
                    <div className="item" key={it.id} data-automation-id={'item-$(it.id'}>
                        <input
                            type="checkbox"
                            data-automation-id={'item-toggle-${it.id}'}
                            checked={!!it.done}
                            onChange={e=>toggle(it.id, e.target.checked)}
                        />
                        <span data-automation-id={`item-name-${it.id}`}>{it.name}</span>
                        <button
                            data-automation-id={'item-delete-${it.id}'}
                            onClick={()=>remove(it.id)}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

Integrated into `App.tsx` (already included).

Features: - Add new items - Toggle done/undone - Delete items

------------------------------------------------------------------------


