import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Pool, QueryResult, QueryResultRow } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load dotenv only if DATABASE_URL not already set
if (!process.env.DATABASE_URL) {
    const envFile =
        process.env.NODE_ENV === "production"
            ? path.join(__dirname, "../.env.production")
            : path.join(__dirname, "../.env.local");

    dotenv.config({ path: envFile });
    console.log("DATABASE_URL raw:", process.env.DATABASE_URL);
} else {
    console.log('DATABASE_URL provided by environment:', process.env.DATABASE_URL);
}

// Schema file path (only used locally/dev)
const schemaPath =
    process.env.NODE_ENV === "production"
        ? path.join(__dirname, "schema.sql")       // in dist/ when built
        : path.join(__dirname, "../src/schema.sql"); // in src/ during dev

const pool = new Pool({
    connectionString: process.env.DATABASE_URL?.trim(),
});

export async function initDb(): Promise<void> {
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('✅ Schema applied');
    } else {
        console.warn(`⚠️ Schema file not found at ${schemaPath}, skipping initDb.`);
    }
}

export async function query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: any[]
): Promise<QueryResult<T>> {
    return pool.query<T>(text, params);
}