import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, query } from './db.js';
import routes from "./routes.js";
import fs from 'fs';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cookieParser());

// --- CORS Setup ---
const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://qa-practice-client.web.app'
];

const envOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : [];
const allowedOrigins = [...defaultOrigins, ...envOrigins];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,PUT,POST,PATCH,DELETE,OPTIONS",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  credentials: true,
}));

// --- API routes ---
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

// --- Serve frontend in production ---
// --- Unused as we're leveraging Firebase ---
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientDist = path.join(__dirname, '../../client/dist');

  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  } else {
    console.warn("⚠️ Client build not found at", clientDist);
  }
}

// --- Global error handler ---
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({ ok: false, error: err.message });
});

const port = Number(process.env.PORT || 4001);
console.log(`📡 Using port: ${port} (from ${process.env.PORT ? "env" : "default"})`);

(async () => {
  try {
    await initDb();
    console.log("✅ DB connected");
  } catch (err) {
    console.error("❌ DB init failed:", err);
  }
  const server = app.listen(port, () => {
    console.log(`[Server] listening on http://localhost:${port}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${port} is already in use. Try setting a different PORT in your .env file.`);
      process.exit(1);
    } else {
      throw err;
    }
  });
})();