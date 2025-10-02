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
    const { category, priority, search, sort } = req.query;

    // Simulate network delay if delay param is present
    const delay = parseInt(req.query.delay as string) || 0;
    if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    let queryStr = 'select * from items where owner_id=$1';
    const params: any[] = [userId];
    let paramCount = 1;

    if (category) {
        paramCount++;
        queryStr += ` and category=$${paramCount}`;
        params.push(category);
    }

    if (priority) {
        paramCount++;
        queryStr += ` and priority=$${paramCount}`;
        params.push(priority);
    }

    if (search) {
        paramCount++;
        queryStr += ` and (name ilike $${paramCount} or description ilike $${paramCount})`;
        params.push(`%${search}%`);
    }

    // Sorting
    if (sort === 'name_asc') queryStr += ' order by name asc';
    else if (sort === 'name_desc') queryStr += ' order by name desc';
    else if (sort === 'priority') queryStr += ' order by case when priority=\'high\' then 1 when priority=\'medium\' then 2 else 3 end';
    else if (sort === 'created_asc') queryStr += ' order by created_at asc';
    else queryStr += ' order by created_at desc';

    const { rows } = await query(queryStr, params);
    res.json(rows);
});

router.post('/items', authMiddleware, async (req, res) => {
    const userId = (req as any).userId;
    const { name, description, category, priority } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required' });
    }
    if (name.length > 100) {
        return res.status(400).json({ error: 'Name must be less than 100 characters' });
    }

    const { rows } = await query(
        'insert into items (owner_id, name, description, category, priority) values ($1, $2, $3, $4, $5) returning *',
        [userId, name, description || null, category || 'personal', priority || 'medium']
    );
    res.json(rows[0]);
});

router.patch('/items/:id', authMiddleware, async (req, res) => {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { done, name, description, category, priority } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    if (done !== undefined) {
        paramCount++;
        updates.push(`done=$${paramCount}`);
        params.push(done);
    }
    if (name !== undefined) {
        paramCount++;
        updates.push(`name=$${paramCount}`);
        params.push(name);
    }
    if (description !== undefined) {
        paramCount++;
        updates.push(`description=$${paramCount}`);
        params.push(description);
    }
    if (category !== undefined) {
        paramCount++;
        updates.push(`category=$${paramCount}`);
        params.push(category);
    }
    if (priority !== undefined) {
        paramCount++;
        updates.push(`priority=$${paramCount}`);
        params.push(priority);
    }

    paramCount++;
    updates.push(`updated_at=now()`);
    params.push(id);
    paramCount++;
    params.push(userId);

    const { rows } = await query(
        `update items set ${updates.join(', ')} where id=$${paramCount} and owner_id=$${paramCount + 1} returning *`,
        params
    );

    if (rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
    }

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