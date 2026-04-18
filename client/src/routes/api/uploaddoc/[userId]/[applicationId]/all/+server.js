import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';
import { verifyToken } from '$lib/jwtverify';

// GET - Get all documents for an application
export async function GET({ params ,request}) {
  const auth = verifyToken(request);
  if (!auth.success) {
      return json({ message: auth.message }, { status: 401 });
  }
  const { userId, applicationId } = params;

  try {
    const result = await pool.query(
      `SELECT 
        ud.seq_no,
        ud.application_id,
        ud.document_id,
        ud.document_name,
        ud.document_size,
        ud.upload_date,
        ud.file_name,
        ud.org_filename,
        ud.status,
        ud.iteration,
        mu.eng_name,
        mu.dev_name,
        mu.upload_for
      FROM public.upload_docs ud
      LEFT JOIN public.m_upload_docs mu ON ud.document_id = mu.id
      WHERE ud.application_id = $1 AND ud.status = 1
      ORDER BY mu.upload_for, ud.document_id`,
      [applicationId]
    );

    return json({
      error: 0,
      documents: result.rows
    });

  } catch (err) {
    console.error('Error fetching documents:', err);
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  }
}