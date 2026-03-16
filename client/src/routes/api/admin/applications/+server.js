import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';

export async function GET({ url, request }) {

  // Verify admin token
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
  }

  const district = url.searchParams.get('district'); // "PUNE"
  if (!district) {
    return json({ error: -1, errorMsg: 'District is required' }, { status: 400 });
  }

  try {

    // Step 1 — get dist_id from m_district table
    const districtResult = await pool.query(
      `SELECT dist_id FROM m_district 
       WHERE UPPER(eng_name) = UPPER($1) 
       LIMIT 1`,
      [district]
    );

    if (districtResult.rows.length === 0) {
      return json({ error: -1, errorMsg: `District not found: ${district}` }, { status: 404 });
    }

    const distId = districtResult.rows[0].dist_id;

    // Step 2 — get all applications for this district
    const applicationsResult = await pool.query(
      `SELECT 
        pd.id,
        pd.name,
        pd.mobile,
        pd.email,
        pd.dob,
        pd.gender,
        pd.district_id,
        pd.application_status,
        pd.form_no,
        pd.verification_status,
        pd.recommendation,
        pd.final_confirmation,
        pd.updated_at,
        md.eng_name AS district_name
       FROM personal_details pd
       LEFT JOIN m_district md 
         ON pd.district_id = md.dist_id 
         AND md.state_id = 1 
         AND md.country_id = 1
       WHERE pd.district_id = $1
       ORDER BY pd.updated_at DESC`,
      [distId]
    );

    const applications = applicationsResult.rows;
    const total = applications.length;
    const approved = applications.filter(a => a.application_status === 'approved').length;
    const pending  = applications.filter(a => a.application_status === 'submitted' || a.application_status === 'pending').length;
    const rejected = applications.filter(a => a.application_status === 'rejected').length;

    return json({
      error: 0,
      district: district,
      dist_id: distId,
      total,
      approved,
      pending,
      rejected,
      applications
    });

  } catch (err) {
    console.error('Admin applications fetch error:', err);
    return json({ error: -1, errorMsg: 'Server error' }, { status: 500 });
  }
}