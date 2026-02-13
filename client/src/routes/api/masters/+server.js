import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';

export async function GET() {
  let client;
  
  try {
    
    client = await pool.connect();
    
    //District from master table
    let result = await client.query(
      `SELECT 
        dist_id, 
        eng_name, 
        dev_name, 
        state_id, 
        country_id, 
        status, 
        short_name,
        seq_no,
        division,
        created,
        modify
      FROM public.m_district
      WHERE status = 1
      ORDER BY eng_name`
    );
    
    const m_district = result.rows;

    //Gender master table
    result = await client.query(
      `SELECT id, eng_name, dev_name FROM public.m_gender`
    );

    const m_gender = result.rows;
    
    // Return the result as JSON
    return json({
      error: 0,
      errorMsg: "Districts fetched successfully",
      masters: {
        m_district,
        m_gender
      },
      count: m_district.length,
      count1 : m_gender.length
    });
    
  } catch (err) {
    console.error("Error executing query", err);
    return json({ 
      error: -1, 
      errorMsg: "Database query failed",
      masters: {
        m_district: [],
        m_gender: []
      }
    }, { status: 500 });
    
  } finally {
    if (client) {
      await client.release();
    }
  }
}