import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';

export async function GET({ url, request }) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
  }

  const page    = Math.max(1, parseInt(url.searchParams.get('page')  || '1'));
  const perPage = Math.min(50, parseInt(url.searchParams.get('limit') || '10'));
  const offset  = (page - 1) * perPage;

  try {
    // ── Total count — only Forwarded applications (status 4, 8, 9) ──
    const countResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM personal_details
       WHERE application_status IN (4, 8, 9)`
    );
    const totalCount = parseInt(countResult.rows[0].total);

    // ── Stats breakdown within Forwarded only ──
    const statsResult = await pool.query(
      `SELECT application_status, COUNT(*) AS cnt
       FROM personal_details
       WHERE application_status IN (4, 8, 9)
       GROUP BY application_status`
    );

    let approved = 0;
    statsResult.rows.forEach(r => {
      approved += parseInt(r.cnt);
    });

    // ── Paginated applications — Forwarded only ──
    const dataResult = await pool.query(
      `SELECT
        pd.id,
        pd.name,
        pd.mobile,
        pd.email,
        pd.application_status,
        mas.eng_name  AS application_status_name,
        pd.updated_at,
        md.eng_name   AS district_name,
        mr.eng_name   AS community,
        ed.loan_required_amount,
        ed.course_name,
        pd.form_no,
        (SELECT COUNT(*) FROM verification_answers va
         WHERE va.application_id = pd.id) AS answer_count
       FROM personal_details pd
       JOIN m_district md            ON pd.district_id::numeric = md.dist_id
       JOIN m_religion mr            ON pd.religion = mr.id
       JOIN education_details ed     ON pd.id = ed.id
       JOIN m_application_status mas ON pd.application_status = mas.id
       WHERE pd.application_status IN (4, 8, 9)
       ORDER BY pd.updated_at DESC
       LIMIT $1 OFFSET $2`,
      [perPage, offset]
    );

    return json({
      error:        0,
      errorMsg:     '',
      total:        totalCount,
      approved,
      pending:      0,
      underReview:  0,
      rejected:     0,
      page,
      perPage,
      totalPages:   Math.ceil(totalCount / perPage),
      applications: dataResult.rows
    });

  } catch (err) {
    console.error('Scrutiny state applications error:', err);
    return json({ error: -1, errorMsg: 'Server error' }, { status: 500 });
  }
}