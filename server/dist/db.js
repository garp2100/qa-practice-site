import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Pool } from 'pg';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envFile = process.env.NODE_ENV === "production"
    ? path.join(__dirname, "../.env.production")
    : path.join(__dirname, "../.env.local");
dotenv.config({ path: envFile });
console.log("DATABASE_URL raw:", process.env.DATABASE_URL);
const pool = new Pool({
    connectionString: process.env.DATABASE_URL?.trim(),
});
export async function initDb() {
    const schemaPath = path.join(__dirname, '../src/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
}
export async function query(text, params) {
    return pool.query(text, params);
}
