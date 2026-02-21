import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';

export async function GET({ url }) {
  try {
    const districtId = url.searchParams.get('district_id');
    const stateId = url.searchParams.get('state_id');
    const countryId = url.searchParams.get('country_id');

    if (!districtId || !stateId || !countryId) {
      return json({
        error: -1,
        errorMsg: "Missing required parameters",
        talukas: []
      }, { status: 400 });
    }

    const result = await pool.query(`
      SELECT 
        taluka_id,
        eng_name,
        dev_name,
        dist_id,
        state_id,
        country_id
      FROM public.m_taluka
      WHERE dist_id = $1 
        AND state_id = $2 
        AND country_id = $3
        AND status = 1
      ORDER BY eng_name
    `, [districtId, stateId, countryId]);

    return json({
      error: 0,
      errorMsg: "Talukas fetched successfully",
      talukas: result.rows,
      count: result.rowCount
    });

  } catch (err) {
    console.error("Error fetching talukas:", err);
    return json({
      error: -1,
      errorMsg: "Database query failed",
      talukas: []
    }, { status: 500 });
  }
}