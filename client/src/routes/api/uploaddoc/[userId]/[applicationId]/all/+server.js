import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';

// GET - Get all documents for an application
export async function GET({ params }) {
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
        ud.doc_key,
        ud.status,
        mu.eng_name,
        mu.dev_name
       FROM public.upload_docs ud
       LEFT JOIN public.m_upload_docs mu ON ud.document_id = mu.doc_id
       WHERE ud.application_id = $1 AND ud.status = 1
       ORDER BY ud.upload_date DESC`,
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