import { json } from '@sveltejs/kit';
import pool from '$lib/db';
import { verifyToken } from '$lib/jwtverify';

export async function GET({ params, request }) {
  const auth = verifyToken(request);
  if (!auth.success) {
    return json({ message: auth.message }, { status: 401 });
  }

  const { user: userId, applicationId } = params;

  const client = await pool.connect();
  try {
    //  1. Verify ownership 
    const ownerCheck = await client.query(
      `SELECT application_id FROM user_applications
       WHERE user_id = $1 AND application_id = $2 LIMIT 1`,
      [userId, applicationId]
    );
    if (ownerCheck.rows.length === 0) {
      return json({ error: -1, errorMsg: 'Application not found' }, { status: 404 });
    }

    // 2. Get reviewer name via correct chain 
    // Get verification_status from personal_details
    const pdResult = await client.query(
      `SELECT verification_status
       FROM personal_details
       WHERE id = $1`,
      [applicationId]
    );

    let adminDisplayName        = 'NA';
    let verificationStatusLabel = 'NA';
    let rejectedAt              = null;
    let remark                  = '';

    if (pdResult.rows.length > 0) {
      const verificationStatusId = pdResult.rows[0].verification_status;

      if (verificationStatusId) {
        const mvsResult = await client.query(
          `SELECT id, eng_name, veri_id
           FROM m_verification_status
           WHERE id = $1
           LIMIT 1`,
          [verificationStatusId]
        );

        if (mvsResult.rows.length > 0) {
          verificationStatusLabel = mvsResult.rows[0].eng_name || 'Rejected';
          const veriId = mvsResult.rows[0].veri_id;

          // Step 3: Match veri_id with m_verification_id.id
          //and get name -> this is printed as "Reviewed by "
          if (veriId) {
            const mviResult = await client.query(
              `SELECT name
               FROM m_verification_id
               WHERE id = $1
               LIMIT 1`,
              [veriId]
            );

            if (mviResult.rows.length > 0) {
              adminDisplayName = mviResult.rows[0].name || 'District Office';
            }
          }
        }
      }
    }

    // 3. Get remark and rejected_at from verification table 
    const verificationResult = await client.query(
      `SELECT v.remark,
              v.created_at AS rejected_at
       FROM verification v
       WHERE v.application_id = $1
         AND v.status IN (12, 5)
       ORDER BY v.id DESC
       LIMIT 1`,
      [applicationId]
    );

    if (verificationResult.rows.length > 0) {
      remark     = verificationResult.rows[0].remark || '';
      rejectedAt = verificationResult.rows[0].rejected_at;
    }

    // 4. Rejection reasons 
    const reasonsResult = await client.query(
      `SELECT arr.reason_code,
              mr.reason_text_english,
              mr.reason_text_marathi
       FROM application_reject_reasons arr
       JOIN m_rejectreasons mr ON mr.reason_code = arr.reason_code
       WHERE arr.application_id = $1`,
      [applicationId]
    );

   

    // 7. Return response 
    return json({
      error: 0,
      data: {
        adminDisplayName,
        verificationStatusLabel,
        rejectedAt,
        remark,
        reasons: reasonsResult.rows,
      },
    });

  } catch (err) {
    console.error('getRejectionDetails error:', err);
    return json(
      { error: -2, errorMsg: 'Server error: ' + err.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}