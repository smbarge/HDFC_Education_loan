// src/routes/api/test-db/+server.js
import pool from '$lib/db';

export async function GET() {
  const result = await pool.query('SELECT NOW()');
  return new Response(JSON.stringify(result.rows[0]), {
    headers: { 'Content-Type': 'application/json' }
  });
}
