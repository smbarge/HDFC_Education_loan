import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';

function checkAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  try {
    const parts = authHeader.split(' ')[1].split('.');
    if (parts.length !== 3) return false;
    const p = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    return !!(p.sub || p.preferred_username || p.iss);
  } catch { return false; }
}

// Extract user_id and get office_id (district_id) from token/username
async function getOfficeId(client, username) {
  // username = "pune_admin" → district name = "pune"
  // Look up dist_id from m_district using username prefix
  const districtName = username.replace('_admin', '').replace(/_/g, ' ');
  const result = await client.query(
    `SELECT dist_id FROM m_district WHERE LOWER(eng_name) = LOWER($1) LIMIT 1`,
    [districtName]
  );
  return result.rows[0]?.dist_id || 1;
}

function getUserFromToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const tokenStr = authHeader.split(' ')[1];
    const payload = JSON.parse(Buffer.from(tokenStr.split('.')[1], 'base64').toString('utf-8'));
    return {
      user_id: payload.sub || payload.preferred_username || 'unknown',
      username: payload.preferred_username || ''
    };
  } catch { return { user_id: 'unknown', username: '' }; }
}

// GET — load existing answers for an application
export async function GET({ request, url }) {
  if (!checkAuth(request)) return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });

  const application_id = url.searchParams.get('application_id');
  if (!application_id) return json({ error: -1, errorMsg: 'application_id required' });

  const client = await pool.connect();
  try {
    const { user_id, username } = getUserFromToken(request);
    const office_id = await getOfficeId(client, username);

    // Get latest verification_id for this application + office
    const verResult = await client.query(
      `SELECT id FROM verification 
       WHERE application_id = $1 AND office_id = $2 
       ORDER BY id DESC LIMIT 1`,
      [application_id, office_id]
    );
    const verification_id = verResult.rows[0]?.id || 0;

    // Load existing answers
    const result = await client.query(
      `SELECT question_id, answer 
       FROM verification_answers 
       WHERE application_id = $1 AND office_id = $2 AND verification_id = $3`,
      [application_id, office_id, verification_id]
    );

    const answers = {};
    result.rows.forEach(r => { answers[r.question_id] = r.answer; });

    return json({ error: 0, answers, office_id, verification_id });
  } catch (err) {
    console.error('verify GET error:', err.message);
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}

// POST — save answer or final decision
export async function POST({ request }) {
  if (!checkAuth(request)) return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { action } = body;
  const { user_id, username } = getUserFromToken(request);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const office_id = await getOfficeId(client, username);

    // ── Save individual Yes/No answer ──
    if (action === 'saveAnswer') {
      const { application_id, checkpoint_id, question_id, answer, verification_id = 0, property_id = 1, level = 1 } = body;

      await client.query(`
        INSERT INTO verification_answers
          (application_id, office_id, checkpoint_id, question_id, user_id, answer, level, verification_id, property_id, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (application_id, office_id, question_id, verification_id, property_id)
        DO UPDATE SET answer = $6, updated_at = NOW()
      `, [application_id, office_id, checkpoint_id, question_id, user_id, answer, level, verification_id, property_id]);

      await client.query('COMMIT');
      return json({ error: 0 });
    }

    // ── Final decision: Forward(11), Reject(12), Return(13) ──
    if (action === 'finalDecision') {
      const { application_id, decision, remark, level = 1, verification_type = 1, iteration = 1 } = body;
      const statusMap = { forward: 11, reject: 12, return: 13 };
      const recommendationMap = { forward: 1, reject: 2, return: 3 };
      const newStatus = statusMap[decision];
      const recommendation = recommendationMap[decision];

      if (!newStatus) {
        await client.query('ROLLBACK');
        return json({ error: -1, errorMsg: 'Invalid decision' });
      }

      // Get next id for verification table
      const maxIdRes = await client.query(`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM verification`);
      const next_id = maxIdRes.rows[0].next_id;

      // Insert or update verification row
      await client.query(`
        INSERT INTO verification
          (id, application_id, verification_type, level, user_id, status, office_id, recommendation, remark, iteration, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (id, application_id)
        DO UPDATE SET
          status = $6, recommendation = $8, remark = $9, updated_at = NOW()
      `, [next_id, application_id, verification_type, level, user_id, newStatus, office_id, recommendation, remark || '', iteration]);

      // Update personal_details.verification_status
      await client.query(
        `UPDATE personal_details SET verification_status = $1, updated_at = NOW() WHERE id = $2`,
        [newStatus, application_id]
      );

      await client.query('COMMIT');
      return json({ error: 0, newStatus, verification_id: next_id });
    }

    await client.query('ROLLBACK');
    return json({ error: -1, errorMsg: 'Invalid action' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('verify POST error:', err.message);
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}