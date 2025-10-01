// Handles hashing passwords, verifying, and issuing JWTs.
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './db.js';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
export async function register(email, password) {
    const hash = await bcrypt.hash(password, 10);
    await query('insert into users (email, password_hash) values ($1, $2) on conflict (email) do nothing', [email, hash]);
    const { rows } = await query('select id, email from users where email = $1', [email]);
    return rows[0];
}
export async function login(email, password) {
    const { rows } = await query('select id, email, password_hash from users where email = $1', [email]);
    const user = rows[0];
    if (!user)
        return null;
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)
        return null;
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
    return token; // raw string, not { token }
}
export function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth)
        return res.status(401).json({ error: 'missing auth header' });
    const token = auth.replace('Bearer ', '').trim();
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.sub;
        next();
    }
    catch {
        return res.status(401).json({ error: 'invalid token' });
    }
}
