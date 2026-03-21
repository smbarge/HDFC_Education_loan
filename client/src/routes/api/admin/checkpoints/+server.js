import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';
import { verifyToken } from '$lib/jwtverify.js';

function checkAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const tokenStr = authHeader.split(' ')[1];
  const auth = verifyToken({ headers: { get: () => authHeader } });
  if (auth.success) return true;
  try {
    const parts = tokenStr.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    return !!(payload.iss && payload.iss.includes('keycloak'));
  } catch { return false; }
}

export async function GET({ request }) {
  if (!checkAuth(request)) {
    return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all checkpoints (id = document_id mapping)
    const checkpointRes = await pool.query(`
      SELECT id, checkpoint_name, description
      FROM m_checkpoint
      WHERE status = 1
      ORDER BY id
    `);

    // Fetch all questions grouped by checkpoint_id
    const questionRes = await pool.query(`
      SELECT id, checkpoint_id, question, dev_question,
             instruction_eng, instruction_dev, mandatory_field, document_id
      FROM m_checkpoint_questions
      WHERE status = 1
      ORDER BY checkpoint_id, id
    `);

    // Group questions by checkpoint_id
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
        document_id: q.document_id ? String(q.document_id) : null,
        checkpoint_id: q.checkpoint_id
      });
    });

    // Build byDocument map: checkpoint.id = document_id key
    const byDocument = {};
    checkpointRes.rows.forEach(cp => {
      const docId = String(cp.id);
      byDocument[docId] = {
        checkpoint_id: cp.id,
        checkpoint_name: cp.checkpoint_name,
        description: cp.description,
        questions: questionsByCheckpoint[docId] || []
      };
    });

    return json({ error: 0, byDocument });

  } catch (err) {
    console.error('Checkpoints error:', err.message);
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  }
}


// import { json } from '@sveltejs/kit';
// import pool from '$lib/db.js';
// import { verifyToken } from '$lib/jwtverify.js';

// export async function GET({ request }) {

//   //Check Auth user
//   const authHeader = request.headers.get('authorization');
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
//   }

//   //Extract token
//   const tokenStr = authHeader.split(' ')[1];

//   // Verify Token
//   const auth = verifyToken(tokenStr); 
  
//   if (!auth.success) {
//     try {
//       const parts = tokenStr.split('.'); //Split JWT Token

//       if (parts.length !== 3) {
//         return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
//       }

//       const payload = JSON.parse(
//         Buffer.from(parts[1], 'base64').toString('utf-8')
//       );

//       if (!payload.iss || !payload.iss.includes('keycloak')) {
//         return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
//       }

//     } catch (e) {
//       return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
//     }
//   }

//   try {

//     const checkpointRes = await pool.query(`
//       SELECT id, checkpoint_name, description
//       FROM m_checkpoint1
//       WHERE status = 1
//       ORDER BY id
//     `);

//     const questionRes = await pool.query(`
//       SELECT 
//         id,
//         checkpoint_id,
//         question,
//         dev_question,
//         instruction_eng,
//         instruction_dev,
//         mandatory_field,
//         document_id
//       FROM m_checkpoint_questions1
//       WHERE status = 1
//       ORDER BY checkpoint_id, id
//     `);

//     // console.log('Checkpoints:', checkpointRes.rows.length);
//     // console.log('Questions sample:', JSON.stringify(questionRes.rows.slice(0,3), null, 2));

//     //maping 
//     const questionsByCheckpoint = {};

//     questionRes.rows.forEach(q => {
//       const cid = String(q.checkpoint_id);

//       if (!questionsByCheckpoint[cid]) {
//         questionsByCheckpoint[cid] = [];
//       }

//       questionsByCheckpoint[cid].push({
//         id: q.id,
//         question: q.question,
//         dev_question: q.dev_question,
//         instruction_eng: q.instruction_eng,
//         instruction_dev: q.instruction_dev,
//         mandatory_field: q.mandatory_field,
//         document_id: q.document_id ? String(q.document_id) : null
//       });
//     });

//     //Merging
//     const byDocument = {};

//     checkpointRes.rows.forEach(cp => {
//       const docId = String(cp.id);

//       byDocument[docId] = {
//         checkpoint_id: cp.id,
//         checkpoint_name: cp.checkpoint_name,
//         description: cp.description,
//         questions: questionsByCheckpoint[docId] || []
//       };
//     });

//     return json({
//       error: 0,
//       errorMsg : " ",
//       byDocument
//     });

//   } catch (err) {
//     console.error('Error fetching checkpoints:', err.message); 
//     return json({ error: -1, errorMsg: 'Internal Server Error' }, { status: 500 });
//   }
// }