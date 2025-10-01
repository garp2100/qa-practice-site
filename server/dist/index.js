import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDb, query } from './db.js';
import routes from "./routes.js";
const app = express();
app.use(express.json());
app.use(cookieParser());
// --- CORS Setup ---
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://qa-practice-client.web.app'] // Prod: Firebase Hosting
    : ['http://localhost:5173']; // Dev: Vite local server
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
// -------------------
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
