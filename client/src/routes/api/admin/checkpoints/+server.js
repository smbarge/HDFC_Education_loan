import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';
import { verifyToken } from '$lib/jwtverify.js';

// function checkAuth(request) {
//   const authHeader = request.headers.get('authorization');
//   if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
//   const tokenStr = authHeader.split(' ')[1];
//   const auth = verifyToken({ headers: { get: () => authHeader } });
//   if (auth.success) return true;
//   try {
//     const parts = tokenStr.split('.');
//     if (parts.length !== 3) return false;
//     const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
//     return !!(payload.iss && payload.iss.includes('keycloak'));
//   } catch { return false; }
// }


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

export async function GET({ request }) {
  if (!checkAuth(request)) {
    return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all checkpoints (id = document_id mapping)
    const checkpointRes = await pool.query(`
      SELECT id, checkpoint_name, description
      FROM m_checkpoint1
      WHERE status = 1
      ORDER BY id
    `);

   //console.log("Checkpoint Data:", checkpointRes.rows);


    // Fetch all questions grouped by checkpoint_id
    const questionRes = await pool.query(`
      SELECT id, checkpoint_id, question, dev_question,
             instruction_eng, instruction_dev, mandatory_field, document_id
      FROM m_checkpoint_questions1
      WHERE status = 1
      ORDER BY checkpoint_id, id
    `);

    //console.log("Question Data:", questionRes.rows);


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

    //console.log("Questions By Checkpoint:", questionsByCheckpoint);

    // const uploadDocIdToCheckpointId = {
    //   1:1, 2:2, 3:3, 4:4,         // Applicant: Aadhar, PAN, Photo, Signature
    //   10:5,                         // Domicile Certificate
    //   11:6,                         // Minority Community Certificate
    //   12:7,                         // Caste Certificate
    //   13:9,                         // Income Certificate (co-applicant) → checkpoint 9
    //   14:8,                         // Parent/Guardian Aadhar → checkpoint 8 (Co-applicant Aadhar)
    //   15:10,                        // Ration Card
    //   17:8,                         // co applicant Aadhar Card → checkpoint 8
    //   18:9,                         // Income Certificate → checkpoint 9
    //   19:10,                        // Ration Card → checkpoint 10
    //   5:11,                         // Admission Offer Letter → checkpoint 11
    //   6:12,                         // Bonafide Certificate → checkpoint 12
    //   7:13,                         // Fee Structure → checkpoint 13
    //   8:14,                         // Previous Year Mark Sheet → checkpoint 14
    //   9:15,                         // Entrance Exam Score Card → checkpoint 15
    //   16:16,                        // Applicant Bank Passbook → checkpoint 16
    //   41:17,                        // Guarantor Aadhaar Card → checkpoint 17
    //   42:18,                        // Guarantor Affidavit → checkpoint 18
    //   43:19,                        // Guarantor Income Certificate → checkpoint 19
    //   44:20,                        // Address Proof → checkpoint 20
    //   35:31,                        // Passport Size Photo with Cross Signature (LIC) → checkpoint 31
    //   36:36,                        // Original Fixed Deposit Receipt → checkpoint 36
    //   37:37,                        // Bank Confirmation Letter → checkpoint 37
    //   38:38,                        // FD Account Statement → checkpoint 38
    //   46:1,                         // FD collateral Aadhar card → checkpoint 1 (Aadhaar Card questions)
    //   39:39,                        // Complete Passport → checkpoint 39
    //   40:40,                        // Valid Visa → checkpoint 40
    // };


   const uploadDocIdToCheckpointId = {
  // Personal — Applicant
  1: 1,   // Aadhar Card → checkpoint 1
  2: 2,   // PAN Card → checkpoint 2
  3: 3,   // Passport Size Photo → checkpoint 3
  4: 4,   // Applicant Signature → checkpoint 4
  10: 5,  // Domicile Certificate → checkpoint 5
  11: 6,  // Minority Community Certificate → checkpoint 6
  12: 7,  // Caste Certificate → checkpoint 7

  // Personal — Co-Applicant
  14: 8,  // Parent/Guardian Aadhar → checkpoint 8
  17: 8,  // Co-applicant Aadhar → checkpoint 8
  13: 9,  // Income Certificate (co-applicant) → checkpoint 9
  18: 9,  // Co Income Certificate → checkpoint 9
  15: 10, // Ration Card → checkpoint 10
  19: 10, // Co Ration Card → checkpoint 10

  // Academic
  5: 11,  // Admission Offer Letter → checkpoint 11
  6: 12,  // Bonafide Certificate → checkpoint 12
  7: 13,  // Fee Structure → checkpoint 13
  8: 14,  // Previous Year Mark Sheet → checkpoint 14
  9: 15,  // Entrance Exam Score Card → checkpoint 15
  16: 16, // Applicant Bank Passbook → checkpoint 16

  // Guarantor
  41: 17, // Guarantor Aadhaar Card → checkpoint 17
  42: 18, // Guarantor Affidavit → checkpoint 18
  43: 19, // Guarantor Income Certificate → checkpoint 19
  44: 20, // Address Proof → checkpoint 20

  // Property Collateral
  20: 21, // Property Ownership Proof → checkpoint 21
  21: 22, // 7/12, 6D, 8A Extract → checkpoint 22
  22: 23, // Property Registration Document → checkpoint 23
  23: 24, // Property Valuation Certificate → checkpoint 24
  24: 25, // Form-24 (A) → checkpoint 25
  45: 41,  // Property collateral Aadhar card → checkpoint 1 (Aadhar questions)

  // Govt Employee Collateral
  25: 26, // Government Employee ID Card → checkpoint 26
  26: 27, // Salary Certificate → checkpoint 27
  27: 28, // Office Certificate → checkpoint 28
  28: 29, // Retirement Proof → checkpoint 29
  29: 30, // Form-24 (B) → checkpoint 30
  48: 42,  // Govt collateral Aadhar card → checkpoint 1 (Aadhar questions)

  // LIC Policy Collateral
  30: 31, // Passport Size Photo with Cross Signature → checkpoint 31
  31: 32, // Original LIC Policy → checkpoint 32
  32: 33, // LIC Premium Payment Receipts → checkpoint 33
  33: 34, // Policy Bond Copy → checkpoint 34
  34: 35, // Policy Status Certificate → checkpoint 35
  47: 43,  // LIC collateral Aadhar card → checkpoint 1 (Aadhar questions)

  // Fixed Deposit Collateral
  35: 45, // Passport Size Photo with Cross Signature (FD) → checkpoint 31
  36: 36, // Original Fixed Deposit Receipt → checkpoint 36
  37: 37, // Bank Confirmation Letter → checkpoint 37
  38: 38, // FD Account Statement → checkpoint 38
  46: 44,  // FD collateral Aadhar card → checkpoint 1 (Aadhar questions)

  // Study Abroad
  39: 39, // Complete Passport → checkpoint 39
  40: 40, // Valid Visa → checkpoint 40
};

    // Build byDocument keyed by m_checkpoint.id (original — keep for reference)
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

    // Build byUploadDocId keyed by upload_docs.document_id
    // This is what the frontend actually uses to look up questions per doc
    const byUploadDocId = {};
    Object.entries(uploadDocIdToCheckpointId).forEach(([uploadDocId, checkpointId]) => {
      const cp = byDocument[String(checkpointId)];
      if (cp) {
        byUploadDocId[String(uploadDocId)] = {
          checkpoint_id: cp.checkpoint_id,
          checkpoint_name: cp.checkpoint_name,
          description: cp.description,
          questions: cp.questions
        };
      }
    });

   // console.log("byUploadDocId keys:", Object.keys(byUploadDocId));

    return json({ error: 0, byDocument: byUploadDocId });

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