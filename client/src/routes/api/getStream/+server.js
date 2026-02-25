import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';

export async function GET({ url }) {
  try {
    const courseId = url.searchParams.get('course_id');

    if (!courseId) {
      return json({
        error: -1,
        errorMsg: "Missing required parameters",
        streams: []
      }, { status: 400 });
    }

    const result = await pool.query(`
      SELECT 
        stream_id,
        eng_name,
        dev_name,
        course_id
      FROM public.m_stream
      WHERE course_id = $1 
      ORDER BY stream_id
    `, [courseId]);

    return json({
      error: 0,
      errorMsg: "stream fetched successfully",
      streams: result.rows,
      count: result.rowCount
    });

  } catch (err) {
    console.error("Error fetching streams:", err);
    return json({
      error: -1,
      errorMsg: "Database query failed",
      streams: []
    }, { status: 500 });
  }
}