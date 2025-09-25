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