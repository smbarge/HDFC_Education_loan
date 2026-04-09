import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';

export async function GET({ request }) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
  }

  try {
    const parts = authHeader.split(' ')[1].split('.');
    if (parts.length !== 3) {
      return json({ error: -1, errorMsg: 'Invalid token' }, { status: 401 });
    }
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    if (!payload.sub && !payload.preferred_username) {
      return json({ error: -1, errorMsg: 'Invalid token payload' }, { status: 401 });
    }
  } catch {
    return json({ error: -1, errorMsg: 'Token parse error' }, { status: 401 });
  }

  try {
    const result = await pool.query(
      `SELECT id, reason_code, reason_text_english, reason_text_marathi 
       FROM m_rejectreasons 
       ORDER BY id`
    );
    return json({ error: 0, reasons: result.rows });
  } catch (err) {
    console.error('Reject reasons error:', err);
    return json({ error: -1, errorMsg: 'Server error' }, { status: 500 });
  }
}