import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';
import { verifyToken } from '$lib/jwtverify.js';

export async function GET({ request }) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
  }

  const auth = verifyToken(request);
  if (!auth.success) {
    try {
      const tokenStr = authHeader.split(' ')[1];
      const parts = tokenStr.split('.');
      if (parts.length !== 3) {
        return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
      }
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      if (!payload.iss || !payload.iss.includes('keycloak')) {
        return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
      }
    } catch (e) {
      return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // Fetch all checkpoints
    const checkpointRes = await pool.query(`
      SELECT id, checkpoint_name, description
      FROM m_checkpoint1
      WHERE status = 1
      ORDER BY id
    `);

    // Fetch all questions with their checkpoint_id
    const questionRes = await pool.query(`
      SELECT 
        id,
        checkpoint_id,
        question,
        dev_question,
        instruction_eng,
        instruction_dev,
        mandatory_field,
        document_id
      FROM m_checkpoint_questions1
      WHERE status = 1
      ORDER BY checkpoint_id, id
    `);

    console.log('Checkpoints:', checkpointRes.rows.length);
    console.log('Questions sample:', JSON.stringify(questionRes.rows.slice(0,3), null, 2));

    // Build map: checkpoint_id -> questions[]
    const questionsByCheckpoint = {};
    questionRes.rows.forEach(q => {
      const cid = String(q.checkpoint_id);
      if (!questionsByCheckpoint[cid]) questionsByCheckpoint[cid] = [];
      questionsByCheckpoint[cid].push({
        id: q.id,
        question: q.question,
        dev_question: q.dev_question,
        instruction_eng: q.instruction_eng,
        instruction_dev: q.instruction_dev,
        mandatory_field: q.mandatory_field,
        document_id: q.document_id ? String(q.document_id) : null
      });
    });

    // Build final: document_id -> { checkpoint, questions[] }
    // m_checkpoint1.id = document_id mapping
    const byDocument = {};
    checkpointRes.rows.forEach(cp => {
      const docId = String(cp.id); // checkpoint id = document_id
      byDocument[docId] = {
        checkpoint_id: cp.id,
        checkpoint_name: cp.checkpoint_name,
        description: cp.description,
        questions: questionsByCheckpoint[String(cp.id)] || []
      };
    });

    return json({
      error: 0,
      byDocument
    });

  } catch (err) {
    console.error('Error fetching checkpoints:', err);
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  }
}