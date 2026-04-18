import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { verifyToken } from '$lib/jwtverify';


export async function GET({ params, request }) {
  const auth = verifyToken(request);
  if (!auth.success) return json({ message: auth.message }, { status: 401 });

  const { userId, applicationId } = params;

  try {
    // Get latest iteration row per document_id where status = 2 (re-uploaded only)
    const result = await pool.query(
      `SELECT DISTINCT ON (ud.document_id)
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
      WHERE ud.application_id = $1
        AND ud.status = 2
      ORDER BY ud.document_id, ud.iteration DESC, ud.created_at DESC`,
      [applicationId]
    );

    return json({ error: 0, documents: result.rows });
  } catch (err) {
    console.error('Error fetching latest resubmit documents:', err);
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  }
}


export async function POST({ params, request }) {
  const auth = verifyToken(request);
  if (!auth.success) return json({ message: auth.message }, { status: 401 });


  const { user, applicationId } = params;

  const contentType = request.headers.get('content-type') || '';

  // CASE 1: File upload (FormData) 
  if (contentType.includes('multipart/form-data')) {
    try {
      const formData = await request.formData();
      const file = formData.get('file');
      const document_id = formData.get('document_id');

      if (!file || !document_id) {
        return json({ error: -1, errorMsg: 'File and document_id are required' });
      }


      const orgFilename =
        (file instanceof File && file.name)
          ? file.name
          : (formData.get('filename') || `document_${document_id}`);

      // Save file to disk
      const uploadDir = join(process.cwd(), 'static', 'uploads', String(user), String(applicationId));
      if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

      const ext = file.name.split('.').pop();
      const fileName = `${document_id}_${Date.now()}.${ext}`;
      const filePath = join(uploadDir, fileName);
      writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));
      const relativeFilePath = `/uploads/${user}/${applicationId}/${fileName}`;

      // Save to upload_docs with status=2 (resubmit)
      const existing = await pool.query(
        `SELECT COALESCE(MAX(iteration), 0) AS max_iteration 
         FROM upload_docs WHERE application_id = $1 AND document_id = $2`,
        [applicationId, document_id]
      );
      const nextIteration = existing.rows[0].max_iteration + 1;

      await pool.query(
        `INSERT INTO upload_docs
           (application_id, document_id, file_name, document_name ,org_filename, document_size, iteration, status, upload_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 2, NOW(), NOW(), NOW())`,
        [
          applicationId,
          document_id,
          relativeFilePath,
          orgFilename,
          orgFilename,         
          file.size ?? 0,
          nextIteration
        ]
      );

      return json({ error: 0, filePath: relativeFilePath, errorMsg: 'Document uploaded successfully' });

    } catch (err) {
      console.error('resubmit upload error:', err);
      return json({ error: -1, errorMsg: err.message || 'Upload failed' }, { status: 500 });
    }
  }

    // CASE 2: Final re-submit
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

    // Check application exists
    const check = await client.query(
      `SELECT application_id FROM user_applications WHERE user_id = $1 AND application_id = $2`,
      [user, applicationId]
    );
    if (check.rows.length === 0) {
      await client.query('ROLLBACK');
      return json({ error: -1, errorMsg: 'Application not found' }, { status: 404 });
    }

    // Update status to 10 - reupload resubmit aplication
    await client.query(
      `UPDATE personal_details 
       SET application_status = 10, verification_status = NULL, updated_at = NOW() 
       WHERE id = $1`,
      [applicationId]
    );

    // // Mark rejected answers as resolved
    // await client.query(
    //   `UPDATE verification_answers SET answer = '1' 
    //    WHERE application_id = $1::integer AND answer = '2'`,
    //   [applicationId]
    // );

    // Insert new verification entry
    const maxRes = await client.query(`SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM verification`);
    await client.query(
      `INSERT INTO verification
         (id, application_id, verification_type, level, user_id, status, created_at, updated_at, office_id, recommendation, remark, iteration)
       VALUES ($1, $2, 1, 0, NULL, 0, NOW(), NOW(), null, 0, NULL, 0)`,
      [maxRes.rows[0].next_id, applicationId]
    );

    await client.query('COMMIT');
    return json({ error: 0, errorMsg: 'Re-submitted successfully', status: 3 });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('resubmit error:', err);
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}

// DELETE — remove latest re-uploaded doc
export async function DELETE({ params, url, request }) {
  const auth = verifyToken(request);
  if (!auth.success) return json({ message: auth.message }, { status: 401 });

  const { applicationId } = params;
  const document_id = url.searchParams.get('document_id');
  if (!document_id) return json({ error: -1, errorMsg: 'document_id required' }, { status: 400 });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `DELETE FROM upload_docs WHERE ctid = (
         SELECT ctid FROM upload_docs
         WHERE application_id = $1 AND document_id = $2
         ORDER BY created_at DESC LIMIT 1
       )`,
      [applicationId, document_id]
    );
    await client.query('COMMIT');
    return json({ error: 0, errorMsg: 'Document deleted' });
  } catch (err) {
    await client.query('ROLLBACK');
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}



// import { json } from "@sveltejs/kit";
// import pool from "$lib/db";

// export async function GET({ request, url }) {
//   const client = await pool.connect();
//   try {
//     let application_id = url.searchParams.get("application_id");

//     let selectQuery = `
//       SELECT * FROM reupload_data
//       WHERE application_id = $1
//         AND iteration = (
//           SELECT MAX(iteration) FROM reupload_data
//           WHERE application_id = $1
//         )`;
//     let result = await client.query(selectQuery, [application_id]);
//     return json({ error: 0, errorMsg: "", details: result.rows });
//   } catch (error) {
//     console.error("error fetching data", error);
//     return json({ error: "Database error", errorMsg: error }, { status: 500 });
//   } finally {
//     client.release();
//   }
// }

// export async function POST({ request }) {
//   const client = await pool.connect();
//   try {
//   const { application_id, iteration, tableName, data, document_id, file_path, org_filename } = await request.json();
//     console.log("reupload POST:", { application_id, iteration, tableName, document_id, file_path });

//     await client.query('BEGIN');

//     // STEP 1: Save each field into reupload_data table
//     if (data && Object.keys(data).length > 0) {
//       const keys   = Object.keys(data);
//       const values = Object.values(data);

//       for (let i = 0; i < keys.length; i++) {
//         await client.query(
//           `INSERT INTO reupload_data
//              (application_id, iteration, table_name, field_name, value)
//            VALUES ($1, $2, $3, $4, $5)
//            ON CONFLICT (application_id, iteration, table_name, field_name)
//            DO UPDATE SET value = $5`,
//           [application_id, iteration, tableName, keys[i], values[i]]
//         );
//       }
//     }

//     // STEP 2: If a file was uploaded, save it to upload_docs table
   
//     if (document_id && file_path) {
//       // Get current max iteration for this document (keep old rows)
//       const existingDoc = await client.query(
//         `SELECT COALESCE(MAX(iteration), 0) AS max_iteration 
//          FROM upload_docs
//          WHERE application_id = $1 AND document_id = $2`,
//         [application_id, document_id]
//       );

//       const nextIteration = existingDoc.rows[0].max_iteration + 1;

//       // Keep old rows, insert new row with incremented iteration
//       await client.query(
//         `INSERT INTO upload_docs
//         (application_id, document_id, file_name, org_filename, iteration, status, upload_date, created_at, updated_at)
//         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())`,
//         [application_id, document_id, file_path, org_filename || '', nextIteration, 2]
//       );
//     }

//         await client.query(
//             `UPDATE personal_details
//             SET application_status  = 3,
//                 verification_status = NULL,
//                 updated_at          = NOW()
//             WHERE id = $1`,
//             [application_id]
//             );

    
//     // STEP 3: Mark this document's verification answers as resolved
//     // if (document_id) {
//     //   await client.query(
//     //     `UPDATE verification_answers
//     //      SET answer     = 1,
//     //          updated_at = NOW()
//     //      WHERE application_id = $1::integer
//     //        AND checkpoint_id  = $2::integer
//     //        AND answer::text   = '2'`,
//     //     [application_id, document_id]
//     //   );
//     // }

//     await client.query('COMMIT');

//     return json({ error: 0, errorMsg: "", application_id, iteration, document_id });

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error("reupload POST error:", error);
//     return json({ error: "Database error", errorMsg: error.message }, { status: 500 });
//   } finally {
//     client.release();
//   }
// }

// export async function DELETE({ url, params }) {
//   const client = await pool.connect();
//   try {
//     const { applicationId } = params;
//     const document_id = url.searchParams.get("document_id");

//     if (!applicationId || !document_id) {
//       return json({ error: 1, errorMsg: "Missing applicationId or document_id" }, { status: 400 });
//     }

//     await client.query('BEGIN');

//     // Delete only the LATEST row by created_at
//     await client.query(
//       `DELETE FROM upload_docs
//        WHERE ctid = (
//          SELECT ctid FROM upload_docs
//          WHERE application_id = $1 AND document_id = $2
//          ORDER BY created_at DESC
//          LIMIT 1
//        )`,
//       [applicationId, document_id]
//     );

//     await client.query('COMMIT');

//     return json({ error: 0, errorMsg: "", applicationId, document_id });

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error("reupload DELETE error:", error);
//     return json({ error: "Database error", errorMsg: error.message }, { status: 500 });
//   } finally {
//     client.release();
//   }
// }


