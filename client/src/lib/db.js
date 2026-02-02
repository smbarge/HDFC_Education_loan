// src/lib/db.js
import { env } from '$env/dynamic/private';
import pkg from 'pg';
const { Pool } = pkg;

console.log('DB_URL is:', env.DB_URL); 

const pool = new Pool({
    connectionString: env.DB_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
});

export default pool;