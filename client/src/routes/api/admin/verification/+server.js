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

function getUserFromCookie(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const username = cookieHeader.match(/adminUsername=([^;]+)/)?.[1] || '';
  return { user_id: username || 'unknown', username };
}

function getUserFromToken(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.split(' ')[1];
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));
    const username = payload.preferred_username || payload.sub || '';
    return { user_id: username || 'unknown', username };
  } catch {
    return { user_id: 'unknown', username: '' };
  }
}

async function getOfficeId(client, username) {
  const districtName = username.replace('_admin', '').replace(/_/g, ' ');
  const result = await client.query(
    `SELECT dist_id FROM m_district WHERE UPPER(eng_name) = UPPER($1) LIMIT 1`,
    [districtName]
  );
  return result.rows[0]?.dist_id || 1;
}

// GET for :loading the existing answers
export async function GET({ request, url }) {
  if (!checkAuth(request)) return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });

  const application_id = url.searchParams.get('application_id');
  if (!application_id) return json({ error: -1, errorMsg: 'application_id required' });

  const client = await pool.connect();
  try {
    const { username } = getUserFromToken(request);
    const office_id = await getOfficeId(client, username);

   const verRes = await client.query(
      `SELECT id FROM verification
      WHERE application_id = $1 AND office_id = $2 AND level = 1
      ORDER BY id DESC LIMIT 1`,
      [application_id, office_id]
    );
    const verification_id = verRes.rows.length > 0 ? verRes.rows[0].id : 1;

    // Load answers
    const ansRes = await client.query(
      `SELECT question_id, answer
       FROM verification_answers
       WHERE application_id = $1 AND office_id = $2 AND verification_id = $3`,
      [application_id, office_id, verification_id]
    );

    const answers = {};
    ansRes.rows.forEach(r => { answers[r.question_id] = r.answer; });
    return json({ error: 0, answers, office_id, verification_id });
  } catch (err) {
    console.error('verification GET error:', err.message);
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}

// POST: saveAnswers OR finalDecision
export async function POST({ request }) {
  if (!checkAuth(request)) return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { action } = body;
  const { user_id, username } = getUserFromToken(request);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const office_id = await getOfficeId(client, username);

    // saveAnswers
    if (action === 'saveAnswers') {
      const { application_id, answers, iteration = 1 } = body;
      // answers = [ { checkpoint_id, question_id, answer } ]

      // STEP 1: "Under Review" (status=3)
      await client.query(
        `UPDATE personal_details SET application_status = 3, updated_at = NOW() WHERE id = $1`,
        [application_id]
      );

      // STEP 2: Check if verification row exists
      const verCheck = await client.query(
        `SELECT id FROM verification
         WHERE application_id = $1 AND office_id = $2 AND level = 1 AND iteration = $3
         LIMIT 1`,
        [application_id, office_id, iteration]
      );

      let verification_id;
      if (verCheck.rows.length > 0) {
        // UPDATE existing row
        verification_id = verCheck.rows[0].id;
        await client.query(
          `UPDATE verification SET status = 19, updated_at = NOW()
           WHERE id = $1 AND application_id = $2`,
          [verification_id, application_id]
        );
      } else {
        // INSERT new row
        const maxRes = await client.query(
          `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM verification`
        );
        verification_id = maxRes.rows[0].next_id;
        await client.query(
          `INSERT INTO verification
             (id, application_id, verification_type, level, user_id,
              status, office_id, recommendation, remark, iteration)
           VALUES ($1, $2, 1, 1, $3, 19, $4, 0, NULL, $5)`,
          [verification_id, application_id, user_id, office_id, iteration]
        );
      }

      // STEP 3: Upsert each answer
      for (const ans of answers) {
        const ansInt = ans.answer === 'yes' || ans.answer === 1 ? 1
                     : ans.answer === 'no'  || ans.answer === 2 ? 2 : null;
        if (ansInt === null) continue;

        await client.query(
          `INSERT INTO verification_answers
             (application_id, office_id, checkpoint_id, question_id,
              user_id, answer, level, verification_id, property_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, 1, $7, 1, NOW(), NOW())
           ON CONFLICT (application_id, office_id, question_id, verification_id, property_id)
           DO UPDATE SET answer = $6, updated_at = NOW()`,
          [application_id, office_id, ans.checkpoint_id, ans.question_id,
           user_id, ansInt, verification_id]
        );
      }

      await client.query('COMMIT');
      return json({ error: 0, verification_id });
    }

    // finalDecision: forward / reject / return 
    
    if (action === 'finalDecision') {
      const { application_id, decision, remark, iteration = 1 } = body;

      // decision values: 'forward'=11, 'reject'=12, 'return'=13
      const statusMap        = { forward: 21, reject: 22, return: 23 };
      const recommendMap     = { forward: 1,  reject: 2,  return: 3  };
      const appStatusMap     = { forward: 4,  reject: 5,  return: 3  };

      const newVerStatus = statusMap[decision]; // verification_status
      const recommendation = recommendMap[decision];
      const newAppStatus   = appStatusMap[decision]; //Application status

      if (!newVerStatus) {
        await client.query('ROLLBACK');
        return json({ error: -1, errorMsg: 'Invalid decision' });
      }

      // Get existing verification row
      const verCheck = await client.query(
        `SELECT id FROM verification
         WHERE application_id = $1 AND office_id = $2 AND level = 1 AND iteration = $3
         LIMIT 1`,
        [application_id, office_id, iteration]
      );

      let verification_id;
      if (verCheck.rows.length > 0) {
        verification_id = verCheck.rows[0].id;
        await client.query(
          `UPDATE verification
           SET status = $1, recommendation = $2, remark = $3, updated_at = NOW()
           WHERE id = $4 AND application_id = $5`,
          [newVerStatus, recommendation, remark || '', verification_id, application_id]
        );
      } else {
        const maxRes = await client.query(
          `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM verification`
        );
        verification_id = maxRes.rows[0].next_id;
        await client.query(
          `INSERT INTO verification
             (id, application_id, verification_type, level, user_id,
              status, office_id, recommendation, remark, iteration)
           VALUES ($1, $2, 1, 1, $3, $4, $5, $6, $7, $8)`,
          [verification_id, application_id, user_id,
           newVerStatus, office_id, recommendation, remark || '', iteration]
        );
      }

              // REPLACE WITH (fixed):
        const updateResult = await client.query(
          `UPDATE personal_details
          SET application_status = $1, verification_status = $2, updated_at = NOW()
          WHERE id = $3`,
          [newAppStatus, newVerStatus, parseInt(application_id)]
        );

        console.log('Rows updated:', updateResult.rowCount);
        console.log('Updated personal_details:', {
          application_id,
          newAppStatus,
          newVerStatus,
          office_id,
          username
        });

        // If rejected — store reason codes into application_reject_reasons
        if (decision === 'reject' && body.reason_codes && body.reason_codes.length > 0) {
          for (const code of body.reason_codes) {
            await client.query(
              `INSERT INTO application_reject_reasons (application_id, reason_code)
              VALUES ($1, $2)
              ON CONFLICT (application_id, reason_code) DO NOTHING`,
              [parseInt(application_id), code]
            );
          }
        }
        await client.query('COMMIT');

      return json({ error: 0, verification_id, newVerStatus, newAppStatus });
    }

    await client.query('ROLLBACK');
    return json({ error: -1, errorMsg: 'Invalid action' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('verification POST error:', err.message);
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}