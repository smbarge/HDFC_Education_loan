import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { verifyToken } from '$lib/jwtverify';

export async function POST({ params, request }) {

  const auth = verifyToken(request);
  if (!auth.success) {
      return json({ message: auth.message }, { status: 401 });
  }

  const { userId, applicationId, docId } = params;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const document_id = formData.get('document_id');
    const isResubmit = formData.get('is_resubmit') === 'true'; 


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
    // await pool.query(
    //   `DELETE FROM public.upload_docs WHERE application_id = $1 AND document_id = $2`,
    //   [applicationId, document_id]
    // );

    //       await pool.query(
    //     `INSERT INTO public.upload_docs 
    //       (seq_no, application_id, document_id, document_name, document_size, file_name, org_filename, status, upload_date, created_at, updated_at)
    //     VALUES (nextval('upload_docs1_seq_no_seq'), $1, $2, $3, $4, $5, $6, 1, NOW(), NOW(), NOW())`,
    //     [applicationId, document_id, file.name, file.size, relativeFilePath, file.name]
    //   );

   if (!isResubmit) {
      // Normal upload: insert into upload_docs with status=1
     await pool.query(
      `DELETE FROM public.upload_docs WHERE application_id = $1 AND document_id = $2`,
      [applicationId, document_id]
    );

     await pool.query(
        `INSERT INTO public.upload_docs 
        (seq_no, application_id, document_id, document_name, document_size, file_name, org_filename, status, upload_date, created_at, updated_at)
        VALUES (nextval('upload_docs1_seq_no_seq'), $1, $2, $3, $4, $5, $6, 1, NOW(), NOW(), NOW())`,
        [applicationId, document_id, file.name, file.size, relativeFilePath, file.name]
      );
    }
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


export async function GET({ params ,request}) {

  const auth = verifyToken(request);
  if (!auth.success) {
      return json({ message: auth.message }, { status: 401 });
  }

  const { applicationId, docId } = params;

  try {
    const documentId = docId; // docId param is now treated as document_id
    const result = await pool.query(
      `SELECT * FROM public.upload_docs WHERE application_id = $1 AND document_id = $2 AND status = 1`,
      [applicationId, documentId]
    );

    if (result.rows.length === 0) {
      return json({ error: -1, errorMsg: 'Document not found' });
    }

    return json({ error: 0, document: result.rows[0] });

  } catch (err) {
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  }
}

export async function DELETE({ params ,request}) {
  const auth = verifyToken(request);
  if (!auth.success) {
      return json({ message: auth.message }, { status: 401 });
  }
  const { applicationId, docId } = params;

  try {
    const result = await pool.query(
      `SELECT file_name FROM public.upload_docs WHERE application_id = $1 AND document_id = $2 AND status = 1`,
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
      WHERE application_id = $1 AND document_id = $2`,
      [applicationId, docId]
    );

    return json({ error: 0, errorMsg: 'Document deleted successfully' });

  } catch (err) {
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  }
}