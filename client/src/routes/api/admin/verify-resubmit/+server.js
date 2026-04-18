import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';
import { verifyToken } from '$lib/jwtverify.js';

function checkAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

  const result = verifyToken(request);
  if (result.success) return true;

  // Fallback: accept Keycloak tokens
  try {
    const tokenStr = authHeader.split(' ')[1];
    const parts = tokenStr.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    return !!(payload.iss && payload.iss.includes('keycloak'));
  } catch { return false; }
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


export async function GET({ request, url }) {
  if (!checkAuth(request)) {
    return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
  }

  const application_id = url.searchParams.get('application_id');
  if (!application_id) {
    return json({ error: -1, errorMsg: 'application_id required' });
  }

  const client = await pool.connect();
  try {
    const { username } = getUserFromToken(request);
    const office_id = await getOfficeId(client, username);

    // Load all saved answers
    const ansRes = await client.query(
      `SELECT va.question_id, va.answer, mcq.document_id
       FROM verification_answers va
       JOIN m_checkpoint_questions1 mcq ON mcq.id = va.question_id
       WHERE va.application_id = $1
         AND va.office_id      = $2
         AND va.verification_id = 1
         AND mcq.status = 1`,
      [application_id, office_id]
    );

    // ── NEW: fetch new (re-uploaded, iteration=2) docs ──────────────────────
    const newDocsRes = await client.query(
      `SELECT DISTINCT ON (document_id) document_id, file_name, org_filename
       FROM upload_docs
       WHERE application_id = $1 AND status = 2
       ORDER BY document_id, updated_at DESC`,
      [application_id]
    );

    // ── NEW: fetch old (original, iteration=1) docs ─────────────────────────
    const oldDocsRes = await client.query(
        `SELECT DISTINCT ON (document_id) document_id, file_name, org_filename
        FROM upload_docs
        WHERE application_id = $1 AND status = 1
        ORDER BY document_id, updated_at ASC`,
        [application_id]
        );

    const newDocMap = {};
    newDocsRes.rows.forEach(r => {
      newDocMap[r.document_id] = { file_name: r.file_name, org_filename: r.org_filename };
    });

   // console.log("newwwww...",newDocMap);


    const oldDocMap = {};
    oldDocsRes.rows.forEach(r => {
      oldDocMap[r.document_id] = { file_name: r.file_name, org_filename: r.org_filename };
    });

   // console.log("OLdddd..",oldDocMap);
    

    const answers = {};
    const rejectedQuestionIds = [];
    const docAnswerMap = {};

    ansRes.rows.forEach(r => {
      answers[r.question_id] = r.answer;
      const docId = r.document_id ? String(r.document_id) : null;
      if (!docId) return;
      if (!docAnswerMap[docId]) docAnswerMap[docId] = { hasNo: false };
      if (r.answer === 2) {
        rejectedQuestionIds.push(r.question_id);
        docAnswerMap[docId].hasNo = true;
      }
    });

    const rejectedDocIds = Object.entries(docAnswerMap)
      .filter(([, v]) => v.hasNo)
      .map(([docId]) => Number(docId));

    return json({
      error: 0,
      answers,
      rejectedQuestionIds,
      rejectedDocIds,
      office_id,
      newDocMap,   
      oldDocMap,  
    });

  } catch (err) {
    console.error('verify-resubmit GET error:', err.message);
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}


export async function POST({ request }) {
  if (!checkAuth(request)) {
    return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;
  const { user_id, username } = getUserFromToken(request);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const office_id = await getOfficeId(client, username);

    //  saveAnswers 
    if (action === 'saveAnswers') {
      const { application_id, answers } = body;

      if (!answers || answers.length === 0) {
        await client.query('ROLLBACK');
        return json({ error: -1, errorMsg: 'No answers provided' });
      }

         const VERIFICATION_ID = 1;

      for (const ans of answers) {
        const ansInt = ans.answer === 'yes' || ans.answer === 1 ? 1
                     : ans.answer === 'no'  || ans.answer === 2 ? 2 : null;
        if (ansInt === null) continue;

        const updateRes = await client.query(
          `UPDATE verification_answers
           SET answer = $1, updated_at = NOW()
           WHERE application_id = $2 AND office_id = $3
             AND question_id = $4 AND verification_id = $5`,
          [ansInt, application_id, office_id, ans.question_id, VERIFICATION_ID]
        );

        if (updateRes.rowCount === 0) {
          await client.query(
            `INSERT INTO verification_answers
               (application_id, office_id, checkpoint_id, question_id,
                user_id, answer, level, verification_id, property_id, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, 2, $7, 1, NOW(), NOW())`,
            [application_id, office_id, ans.checkpoint_id, ans.question_id,
             user_id, ansInt, VERIFICATION_ID]
          );
        }
      }

      await client.query('COMMIT');
      return json({ error: 0, verification_id: VERIFICATION_ID });
    }

    //  finalDecision 
    if (action === 'finalDecision') {
      const { application_id, decision, remark, iteration = 2 } = body;

      const statusMap    = { forward: 11, reject: 12, return: 13 };
      const recommendMap = { forward: 1,  reject: 2,  return: 3  };
      const appStatusMap = { forward: 4,  reject: 5,  return: 3  };

      const newVerStatus  = statusMap[decision];
      const recommendation = recommendMap[decision];
      const newAppStatus  = appStatusMap[decision];

      if (!newVerStatus) {
        await client.query('ROLLBACK');
        return json({ error: -1, errorMsg: 'Invalid decision' });
      }

      const maxRes = await client.query(
        `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM verification`
      );
      const id = maxRes.rows[0].next_id;

      await client.query(
        `INSERT INTO verification
           (id, application_id, verification_type, level, user_id,
            status, office_id, recommendation, remark, iteration)
         VALUES ($1, $2, 1, 2, $3, $4, $5, $6, $7, $8)`,
        [id, application_id, user_id,
         newVerStatus, office_id, recommendation, remark || '', iteration]
      );

      await client.query(
        `UPDATE personal_details
         SET application_status = $1, verification_status = $2, updated_at = NOW()
         WHERE id = $3`,
        [newAppStatus, newVerStatus, parseInt(application_id)]
      );

      if (decision === 'reject' && body.reason_codes?.length > 0) {
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
      return json({ error: 0, id, newVerStatus, newAppStatus });
    }

    await client.query('ROLLBACK');
    return json({ error: -1, errorMsg: 'Invalid action' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('verify-resubmit POST error:', err.message);
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}