import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';
import { reSubmitApplication } from '$lib/api/authApi';

export async function GET({ url, request }) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
  }

  const district = url.searchParams.get('district');
  if (!district) return json({ error: -1, errorMsg: 'District is required' }, { status: 400 });

  // Pagination params
  const page    = Math.max(1, parseInt(url.searchParams.get('page')  || '1'));
  const perPage = Math.min(50, parseInt(url.searchParams.get('limit') || '10'));
  const offset  = (page - 1) * perPage;

  try {
    // get dist_id
    const districtResult = await pool.query(
      `SELECT dist_id FROM m_district WHERE UPPER(eng_name) = UPPER($1) LIMIT 1`,
      [district]
    );
    
    if (districtResult.rows.length === 0) {
      return json({ error: -1, errorMsg: `District not found: ${district}` }, { status: 404 });
    }
    const distId = districtResult.rows[0].dist_id;

    // total count 
    // const countResult = await pool.query(
    //   `SELECT COUNT(*) AS total FROM personal_details
    //    WHERE district_id = $1     
    //    AND application_status IN (2,3,4)`,
    //   [distId]
    // );

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM personal_details
      WHERE district_id = $1
      AND application_status != 1`,
      [distId]
    );
    const totalCount = parseInt(countResult.rows[0].total);

    // stats (approved / pending / rejected)
    // const statsResult = await pool.query(
    //   `SELECT application_status, COUNT(*) AS cnt
    //    FROM personal_details
    //    WHERE district_id = $1
    //    GROUP BY application_status`,
    //   [distId]
    // );


    const statsResult = await pool.query(
      `SELECT application_status, COUNT(*) AS cnt
      FROM personal_details
      WHERE district_id = $1
      AND application_status != 1
      GROUP BY application_status`,
      [distId]
      
    );

    let approved = 0, pending = 0, rejected = 0,underReview = 0,resubmitted = 0;
    statsResult.rows.forEach(r => {
      const status = Number(r.application_status);

      if ([4, 8, 9].includes(status)) approved += parseInt(r.cnt);
      else if ([5, 6, 7].includes(status)) rejected += parseInt(r.cnt);
     else if (status === 3)           underReview  += parseInt(r.cnt);  // ← split out
  else if (status === 2)           pending      += parseInt(r.cnt);  // ← only status 2
  else if (status === 10)             resubmitted   += parseInt(r.cnt); 

    });
    
    // Step 4: paginated data with joins
    const result = await pool.query(
      `SELECT
        pd.id,
        pd.name,
        pd.mobile,
        pd.email,
        pd.application_status,
        mas.eng_name AS application_status_name,
        pd.updated_at,
        md.eng_name  AS district_name,
        mr.eng_name  AS community,
        ed.loan_required_amount,
        ed.course_name,
        pd.form_no,
        (SELECT COUNT(*) FROM verification_answers va 
        WHERE va.application_id = pd.id) AS answer_count
      FROM personal_details pd
      JOIN m_district md ON pd.district_id::numeric = md.dist_id
      JOIN m_religion mr ON pd.religion = mr.id
      JOIN education_details ed ON pd.id = ed.id
      JOIN m_application_status mas ON pd.application_status = mas.id
      WHERE pd.district_id = $1 AND pd.application_status != 1
      ORDER BY pd.updated_at DESC
      LIMIT $2 OFFSET $3`,
      [distId, perPage, offset]
    );

    return json({
      error: 0,
      district,
      dist_id: distId,
      total:    totalCount,
      approved,
      pending,
      rejected,
      underReview,
      resubmitted,
      page,
      perPage,
      totalPages: Math.ceil(totalCount / perPage),
      applications: result.rows
    });

  } catch (err) {
    console.error('Admin applications error:', err);
    return json({ error: -1, errorMsg: 'Server error' }, { status: 500 });
  }
}


//without pagination 

// import { json } from '@sveltejs/kit';
// import pool from '$lib/db.js';

// export async function GET({ url, request }) {
//   const authHeader = request.headers.get('authorization');
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return json({ error: -1, errorMsg: 'Unauthorized' }, { status: 401 });
//   }

//   const district = url.searchParams.get('district');
//   console.log("Distrct is ____:",district);
//   if (!district) return json({ error: -1, errorMsg: 'District is required' }, { status: 400 });

//   try {
//     // Step 1: get dist_id from m_district
//     const districtResult = await pool.query(
//       `SELECT dist_id FROM m_district WHERE UPPER(eng_name) = UPPER($1) LIMIT 1`,
//       [district]
//     );
//     if (districtResult.rows.length === 0) {
//       return json({ error: -1, errorMsg: `District not found: ${district}` }, { status: 404 });
//     }
//     const distId = districtResult.rows[0].dist_id;

//     // Step 2: get applications with all required columns
//     const result = await pool.query(
//       `select 
// 		    pd.id,
//         pd.name,
//         pd.mobile,
//         pd.email,
//         pd.application_status,
//         pd.updated_at,
//         pd.district_id,
// 		    pd.religion,
// 		    md.eng_name as district_name,
// 		    mr.eng_name as religion_name,
// 		    ed.loan_required_amount,
//         ed.course_name
//         from personal_details pd
//         join m_district  md on pd.district_id = md.dist_id
//         join m_religion  mr on pd.religion = mr.id
//         join education_details ed on pd.id = ed.id
//         where pd.district_id = $1
//         ORDER BY pd.updated_at DESC`,
//       [distId]
//     );

//     const applications = result.rows;
//     const total    = applications.length;
//     const approved = applications.filter(a => a.application_status === 'approved').length;
//     const pending  = applications.filter(a => ['submitted', 'pending'].includes(a.application_status)).length;
//     const rejected = applications.filter(a => a.application_status === 'rejected').length;

//     return json({
//       error: 0,
//       district,
//       dist_id: distId,
//       total,
//       approved,
//       pending,
//       rejected,
//       applications
//     });

//   } catch (err) {
//     console.error('Admin applications error:', err);
//     return json({ error: -1, errorMsg: 'Server error' }, { status: 500 });
//   }
// }