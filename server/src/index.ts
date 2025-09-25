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