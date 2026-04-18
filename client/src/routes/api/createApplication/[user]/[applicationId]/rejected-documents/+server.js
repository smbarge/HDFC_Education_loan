import { json } from '@sveltejs/kit';
import pool from '$lib/db';
import { verifyToken } from '$lib/jwtverify';

export async function GET({ params, request }) {

  // 1. Token verification 
  const auth = verifyToken(request);
  if (!auth.success) {
    return json({ message: auth.message }, { status: 401 });
  }

  const { user: userId, applicationId } = params;

  const client = await pool.connect();
  try {

    // 2. Verify ownership
    const ownerCheck = await client.query(
      `SELECT application_id 
       FROM user_applications
       WHERE user_id        = $1 
         AND application_id = $2 
       LIMIT 1`,
      [userId, applicationId]
    );

    if (ownerCheck.rows.length === 0) {
      return json(
        { error: -1, errorMsg: 'Application not found' },
        { status: 404 }
      );
    }

    const latestVerificationId = 1;

    // Check if any answers exist at all for this application
    const answerCheck = await client.query(
      `SELECT COUNT(*) AS cnt
      FROM verification_answers
      WHERE application_id = $1::integer
        AND verification_id = 1
        AND answer = '2'`,
      [applicationId]
    );

      if (parseInt(answerCheck.rows[0]?.cnt || 0) === 0) {
        return json({
          error: 0,
          data: {
            verificationId:    null,
            rejectedDocuments: [],
            totalFlagged:      0
          }
        });
      }

   const answersResult = await client.query(
  `SELECT
      va.checkpoint_id,
      va.question_id,
      va.answer,
      mc.checkpoint_name,
      mc.description          AS checkpoint_description,
      mcq.question            AS question_eng,
      mcq.dev_question        AS question_mar,
      mcq.instruction_eng,
      mcq.instruction_dev     AS instruction_mar
   FROM verification_answers va
   JOIN m_checkpoint1 mc
     ON mc.id = va.checkpoint_id
   JOIN m_checkpoint_questions1 mcq
     ON mcq.id          = va.question_id
    AND mcq.checkpoint_id = va.checkpoint_id
   WHERE va.application_id  = $1::integer
     AND va.verification_id = 1
     AND va.answer = '2'
   ORDER BY va.checkpoint_id ASC, va.question_id ASC`,
  [applicationId]
);

    // Group by checkpoint_id 
    const checkpointMap = {};

    answersResult.rows.forEach(row => {
      const key = String(row.checkpoint_id);

      // Init checkpoint entry
      if (!checkpointMap[key]) {
        checkpointMap[key] = {
          checkpointId:          row.checkpoint_id,
          checkpointName:        row.checkpoint_name,
          checkpointDescription: row.checkpoint_description || '',
          hasRejection:          false,
          failingQuestions:      []
        };
      }

      if (String(row.answer) === '2') {
        checkpointMap[key].hasRejection = true;

        const alreadyAdded = checkpointMap[key].failingQuestions
          .some(q => q.instructionEng === (row.instruction_eng || ''));

        checkpointMap[key].failingQuestions.push({
          questionId:     row.question_id,
          questionEng:    row.question_eng    || '',
          questionMar:    row.question_mar    || '',
          instructionEng: alreadyAdded ? '' : (row.instruction_eng || ''),
          instructionMar: alreadyAdded ? '' : (row.instruction_mar || '')
        });
      }
    });

// Maps m_checkpoint1.id → m_upload_docs.id
const checkpointIdToDocumentId = {
  1:  1,    // Aadhaar Card
  2:  2,    // PAN Card
  3:  3,    // Photo
  4:  4,    // Signature
  5:  10,   // Domicile Certificate
  6:  11,   // Minority Cert
  7:  12,   // Caste Cert
  8:  17,   // Co-applicant Aadhaar
  9:  13,   // Income Certificate
  10: 15,   // Ration Card
  11: 5,    // Admission Letter
  12: 6,    // Bonafide
  13: 7,    // Fee Structure
  14: 8,    // Mark Sheets
  16: 16,   // Bank Passbook
  17: 41,   // Guarantor Aadhaar
  18: 42,   // Guarantor Affidavit
  19: 43,   // Guarantor Income
  20: 44,   // Guarantor Address Proof
  21: 20,   // Property Ownership
  22: 21,   // 7/12 Extract
  23: 22,   // PR Card
  24: 23,   // Valuation Cert
  25: 24,   // Form 24A
  26: 25,   // Govt ID Card
  27: 26,   // Salary Cert
  28: 27,   // Office Cert
  29: 28,   // Retirement Proof
  30: 29,   // Form 24B
  31: 30,   // LIC Photo+Sign
  32: 31,   // LIC Policy Original
  33: 32,   // LIC Premium Receipts
  34: 33,   // Policy Bond
  35: 34,   // Policy Status
  36: 36,   // FD Receipt (Original)
  37: 37,   // Bank Confirmation Letter
  38: 38,   // FD Statement
  39: 39,   // Passport
  40: 40,   // Visa
  41: 45,   // Property Collateral Aadhaar
  42: 48,   // Govt Employee Collateral Aadhaar
  43: 47,   // LIC Collateral Aadhaar
  44: 46,   // FD Collateral Aadhaar
};

// your step 6 filter with this 
const rejectedDocuments = Object.values(checkpointMap)
  .filter(doc => doc.hasRejection)
  .map(doc => ({
    checkpointId:          doc.checkpointId,
    // ADD THIS: the upload_docs.id that the frontend uses
    documentId:            checkpointIdToDocumentId[doc.checkpointId] || doc.checkpointId,
    checkpointName:        doc.checkpointName,
    checkpointDescription: doc.checkpointDescription,
    totalIssues:           doc.failingQuestions.length,
    failingQuestions:      doc.failingQuestions
  }));

// Return ALL rejected docs with documentId 
return json({
  error: 0,
  data: {
    verificationId:    latestVerificationId,
    rejectedDocuments,
    totalFlagged:      rejectedDocuments.length
  }
});

  } catch (err) {
    console.error('getRejectedDocuments error:', err);
    return json(
      { error: -2, errorMsg: 'Server error: ' + err.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}