import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, query } from './db.js';
import routes from "./routes.js";
import fs from 'fs';
const app = express();
app.use(express.json());
app.use(cookieParser());
// --- CORS Quick Hack ---
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});
// --- API routes ---
app.use('/api', routes);
// Health check endpoint
app.get('/api/health', async (_req, res) => {
    try {
        const { rows } = await query('select 1 as ok');
        res.json({ ok: true, db: rows[0].ok === 1 });
    }
    catch (e) {
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
    }
    else {
        console.warn("⚠️ Client build not found at", clientDist);
    }
}
// --- Global error handler ---
app.use((err, _req, res, _next) => {
    console.error("❌ Unhandled error:", err);
    res.status(500).json({ ok: false, error: err.message });
});
const port = Number(process.env.PORT || 4000);
(async () => {
    try {
        await initDb();
        console.log("✅ DB connected");
    }
    catch (err) {
        console.error("❌ DB init failed:", err);
    }
    app.listen(port, () => console.log(`[Server] listening on http://localhost:${port}`));
})();
