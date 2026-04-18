import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';
import { verifyToken } from '$lib/jwtverify';


// POST - Submit application (mark as completed)
export async function POST({ params,request }) {

  const auth = verifyToken(request);
  if (!auth.success) {
      return json({ message: auth.message }, { status: 401 });
  }

  const { user, applicationId } = params;
  
  console.log('Submitting application:', { user, applicationId });
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    //Check if application exists
    const checkResult = await client.query(
      `SELECT application_id , status FROM user_applications WHERE user_id = $1 AND  application_id= $2`,
      [user, applicationId]
    );
    
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return json(
        { error: -1, errorMsg: 'Application not found' },
        { status: 404 }
      );
    }
   
    await client.query(
    `UPDATE personal_details
      SET application_status = 2,verification_status = '00',
      updated_at = now()
       WHERE id = $1`,
      [applicationId]
    );

    // insert verification entry with status 1
    const maxRes = await client.query(
      `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM verification`
    );
    const verification_id = maxRes.rows[0].next_id;

    await client.query(
      `INSERT INTO verification
        (id, application_id, verification_type, level, user_id,
        status, created_at, updated_at, office_id, recommendation, remark, iteration)
      VALUES ($1, $2, 1, 0, NULL, 0, NOW(), NOW(), NULL, 0, NULL, 0)`,
      [verification_id, applicationId]
    );
        
    await client.query('COMMIT');
    
    console.log('Application submitted successfully:', applicationId);
    
    return json({
      error: 0,
      errorMsg: 'Application submitted successfully',
      applicationId: applicationId,
      status: 2
    });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error submitting application:', err);
    return json(
      { error: -1, errorMsg: err.message || 'Failed to submit application' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}