import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, query } from './db.js';
import routes from "./routes.js";
import fs from 'fs';

const app = express();
app.use(express.json());
app.use(cookieParser());

// --- CORS Setup ---
if (process.env.NODE_ENV !== 'production') {
  // Dev: allow any origin (local frontend, Cypress, etc.)
  app.use(cors({ origin: true, credentials: true }));
  console.log("🌐 CORS: allowing all origins in dev");
} else {
  // Prod: lock down to your deployed frontend
  const allowedOrigins = ['https://qa-practice-client.web.app'];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  }));
  console.log("🌐 CORS: restricted to", allowedOrigins);
}

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

const port = Number(process.env.PORT || 4000);

(async () => {
  try {
    await initDb();
    console.log("✅ DB connected");
  } catch (err) {
    console.error("❌ DB init failed:", err);
  }
  app.listen(port, () =>
    console.log(`[Server] listening on http://localhost:${port}`)
  );
})();