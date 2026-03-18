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
    
  //   // Update application status to "submitted" (status = 2)
  //  // Update user_applications status = 2 (Submitted)
  //   await client.query(
  //     `UPDATE user_applications
  //      SET status = 2
  //      WHERE user_id = $1 AND application_id = $2`,
  //     [user, applicationId]
  //   );

    // Update personal_details.application_status = 'submitted'
    // This stores the status text from m_application_status id=2 (Submitted)
    await client.query(
      `UPDATE personal_details
       SET application_status = 2,
      updated_at = now()
       WHERE id = $1`,
      [applicationId]
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