import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';

export async function GET() {

  
  try {
    //client = await pool.connect();

    const [districtRes, 
            genderRes, 
            religionRes,
            maritalStatusRes,
            educationalqualificationRes,
            occupationRes,
            relationRes,
            coursetypeRes,
            modeofstudyRes,
            addmissionstatusRes,
            perposeloanRes,
            propertytypeRes,
            documenttypeRes,
            unitsRes,
            requireddocumentsRes
            ] = await Promise.all([
      
      //for the district Master
      pool.query(`
        SELECT 
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
        ORDER BY eng_name
      `),

      //for the gender master
      pool.query(`
        SELECT 
        id, 
        eng_name, 
        dev_name
        FROM public.m_gender
      `),

      //for the religion master
      pool.query(`
        SELECT 
        id, 
        eng_name, 
        dev_name
        FROM public.m_religion
        ORDER BY id
      `),

      //For the marital status
      pool.query(`
        SELECT 
        id, 
        eng_name, 
        dev_name
        FROM public.m_marital_status
        ORDER BY id
      `),

      //For Educational qualification
      pool.query(`
        SELECT 
        id, 
        eng_name, 
        dev_name
        FROM public.m_educational_qualification
        ORDER BY id
      `),

      //For Occupation
      pool.query(`
        SELECT 
        id, 
        eng_name, 
        dev_name
        FROM public.m_occupation
        ORDER BY id
      `),

      //for m_relation
      pool.query(`
        SELECT 
        id, 
        eng_name, 
        dev_name
        FROM public.m_relation
        ORDER BY id
      `),

      pool.query(`
        SELECT
        course_id,
        eng_name,
        dev_name
        FROM public.m_course_type
        ORDER BY course_id
        `),
  
        pool.query(`
        SELECT
        id,
        eng_name,
        dev_name
        FROM public.m_mode_of_study
        ORDER BY id
        `),

        pool.query(`
        SELECT
        id,
        eng_name,
        dev_name
        FROM public.m_admission_status
        ORDER BY id
        `),

        pool.query(`
        SELECT
        id,
        eng_name,
        dev_name
        FROM public.m_perpose_loan
        ORDER BY id
        `),

        pool.query(`
        SELECT
        id,
        eng_name,
        dev_name
        FROM public.m_property_type
        ORDER BY id
        `),


        pool.query(`
        SELECT
        id,
        eng_name,
        dev_name
        FROM public.m_document_type
        ORDER BY id
        `),

         pool.query(`
        SELECT
        id,
        eng_name,
        dev_name
        FROM public.m_units
        ORDER BY id
        `),

        pool.query(`
        SELECT
        id,
        eng_name,
        dev_name
        FROM public.m_required_documents
        ORDER BY id
        `)

        
    ]);

    return json({
      error: 0,
      errorMsg: "Master Data fetched successfully",
      masters: {
        m_district: districtRes.rows,
        m_gender: genderRes.rows,
        m_religion: religionRes.rows,
        m_marital_status : maritalStatusRes.rows,
        m_educational_qualification : educationalqualificationRes.rows,
        m_occupation : occupationRes.rows,
        m_relation : relationRes.rows,
        m_course_type :coursetypeRes.rows,
        m_mode_of_study : modeofstudyRes.rows,
        m_admission_status : addmissionstatusRes.rows,
        m_perpose_loan : perposeloanRes.rows,
        m_property_type : propertytypeRes.rows,
        m_document_type : documenttypeRes.rows,
        m_units : unitsRes.rows,
        m_required_documents : requireddocumentsRes.rows
      },
      counts: {
        district: districtRes.rowCount,
        gender: genderRes.rowCount,
        religion: religionRes.rowCount,
        maritalstatus : maritalStatusRes.rowCount,
        educationalqualification :educationalqualificationRes.rowCount,
        occupation : occupationRes.rowCount,
        relation: relationRes.rowCount,
        coursetype : coursetypeRes.rowCount,
        modeofstudy : modeofstudyRes.rowCount,
        addmissionstatus : addmissionstatusRes.rowCount,
        perposeloan : perposeloanRes.rowCount,
        propertyttype : propertytypeRes.rowCount,
        documenttype : documenttypeRes.rowCount,
        units : unitsRes.rowCount,
        requireddocuments : requireddocumentsRes.rowCount
      }
    });

  } catch (err) {
    console.error("Error executing query:", err);

    return json({
      error: -1,
      errorMsg: "Database query failed",
      masters: {
        m_district: [],
        m_gender: [],
        m_religion: [],
        m_marital_status:[],
        m_educational_qualification :[],
        m_occupation :[],
        m_relation : [],
        m_course_type :[],
        m_mode_of_study :[],
        m_admission_status :[],
        m_perpose_loan: [],
        m_property_type : [],
        m_document_type : [],
        m_units : [],
        m_required_documents : []
      }
    }, { status: 500 });

  }
}