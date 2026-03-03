import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

export async function POST({ params, request }) {
  const { userId, applicationId, docId } = params;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const document_id = formData.get('document_id');

    if (!file || !document_id) {
      return json({ error: -1, errorMsg: 'File and document_id are required' });
    }

    //Create upload directory
    const uploadDir = join(process.cwd(), 'static', 'uploads', String(userId), String(applicationId));
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    //Generate unique filename
    const ext = file.name.split('.').pop();
    const fileName = `${docId}_${Date.now()}.${ext}`;
    const filePath = join(uploadDir, fileName);

    //Write file to disk
    const arrayBuffer = await file.arrayBuffer();
    writeFileSync(filePath, Buffer.from(arrayBuffer));

    const relativeFilePath = `/uploads/${userId}/${applicationId}/${fileName}`;

    //Delete existing document with same doc_key (replace strategy)
    await pool.query(
      `DELETE FROM public.upload_docs WHERE application_id = $1 AND doc_key = $2`,
      [applicationId, docId]
    );

    //Insert new document record
    await pool.query(
      `INSERT INTO public.upload_docs 
        (application_id, document_id, document_name, document_size, file_name, org_filename, doc_key, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 1)`,
      [applicationId, document_id, file.name, file.size, relativeFilePath, file.name, docId]
    );

    return json({
      error: 0,
      errorMsg: 'Document uploaded successfully',
      filePath: relativeFilePath
    });

  } catch (err) {
    console.error('Upload error:', err);
    return json({ error: -1, errorMsg: err.message || 'Upload failed' }, { status: 500 });
  }
}


export async function GET({ params }) {
  const { applicationId, docId } = params;

  try {
    const result = await pool.query(
      `SELECT * FROM public.upload_docs WHERE application_id = $1 AND doc_key = $2`,
      [applicationId, docId]
    );

    if (result.rows.length === 0) {
      return json({ error: -1, errorMsg: 'Document not found' });
    }

    return json({ error: 0, document: result.rows[0] });

  } catch (err) {
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  }
}

export async function DELETE({ params }) {
  const { applicationId, docId } = params;

  try {
    const result = await pool.query(
      `SELECT file_name FROM public.upload_docs WHERE application_id = $1 AND doc_key = $2`,
      [applicationId, docId]
    );

    if (result.rows.length > 0) {
      const filePath = join(process.cwd(), 'static', result.rows[0].file_name.replace(/^\//, ''));
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    }

    await pool.query(
      `UPDATE public.upload_docs SET status = 0, updated_at = NOW() 
       WHERE application_id = $1 AND doc_key = $2`,
      [applicationId, docId]
    );

    return json({ error: 0, errorMsg: 'Document deleted successfully' });

  } catch (err) {
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  }
}