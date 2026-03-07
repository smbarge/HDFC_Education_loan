// FILE: src/routes/api/createApplication/[user]/[applicationId]/view/+server.js

import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';



const masterRes = await fetch('http://localhost:5173/api/masters');
const masterData = await masterRes.json();
const masters = masterData.masters;

const genderMap     = Object.fromEntries(masters.m_gender.map(r => [r.id, r.eng_name]));
const religionMap   = Object.fromEntries(masters.m_religion.map(r => [r.id, r.eng_name]));
const maritalMap    = Object.fromEntries(masters.m_marital_status.map(r => [r.id, r.eng_name]));
const occupationMap = Object.fromEntries(masters.m_occupation.map(r => [r.id, r.eng_name]));
const eduQualMap    = Object.fromEntries(masters.m_educational_qualification.map(r => [r.id, r.eng_name]));

const courseTypeMap  = Object.fromEntries(masters.m_course_type.map(r => [r.course_id, r.eng_name]));
const modeStudyMap   = Object.fromEntries(masters.m_mode_of_study.map(r => [r.id, r.eng_name]));
const admissionMap   = Object.fromEntries(masters.m_admission_status.map(r => [r.id, r.eng_name]));
const purposeLoanMap = Object.fromEntries(masters.m_perpose_loan.map(r => [r.id, r.eng_name]));

const propertyTypeMap = Object.fromEntries(masters.m_property_type.map(r => [r.id, r.eng_name]));
const policyTypeMap   = Object.fromEntries(masters.m_policy_type.map(r => [r.id, r.eng_name]));
const districtMap     = Object.fromEntries(masters.m_district.map(r => [r.dist_id, r.eng_name]));
const unitsMap        = Object.fromEntries(masters.m_units.map(r => [r.id, r.eng_name]));


export async function GET({ params }) {
  const { user, applicationId } = params;
  const client = await pool.connect();

  try {
    // 1. Personal Details (Step 1 + Step 2)
    const personalResult = await client.query(
      `SELECT 
        name, aadhar, dob, gender, religion, resident,
        mobile, email, pan,
        current_address, current_district, current_taluka, current_place, current_area, current_pincode,
        permanent_address, permanent_district, permanent_taluka, permanent_place, permanent_area, permanent_pincode,
        marital_status, education_qualification, guardian_name, occupation, income,
        past_surety_commitment, relation
      FROM personal_details WHERE id = $1`,
      [applicationId]
    );

    // 2. Education Details (Step 3)
    const educationResult = await client.query(
      `SELECT 
        student_name, course_name, course_type, stream_specialization, course_duration, mode_of_study,
        institution_name, university, institution_address, institution_district, institution_taluka,
        institution_place, institution_pincode, admission_status, admission_year,
        total_course_fee, fee_paid, remaining_fee, loan_required_amount, purpose_of_loan,
        bank_name, branch_name, ifsc_code, account_number, bank_address, gst_number
        FROM education_details WHERE id = $1`,
      [applicationId]
    );


    // 3. Guarantor Details (Step 4)
    const guarantorResult = await client.query(
      `SELECT * FROM guarantor_personal_details WHERE id = $1`,
      [applicationId]
    );

    // 4. Collateral - Property
    const fdResult = await client.query(
      `SELECT * FROM collateral_fd_information WHERE application_id = $1`,
       [applicationId]
    );

    // 5. Collateral - FD
    const govtResult = await client.query(
      `SELECT * FROM collateral_gov_information WHERE  application_id = $1`,
       [applicationId]
    );

    // 6. Collateral - LIC
    const licResult = await client.query(
      `SELECT * FROM collateral_lic_information WHERE  application_id = $1`,
       [applicationId]
    );

    // 7. Collateral - Govt Employee
    const propertyResult = await client.query(
      `SELECT * FROM collateral_property_information WHERE  application_id = $1`,
       [applicationId]
    );

    // 8. Uploaded Documents (photo + signature)
const docsResult = await client.query(
  `SELECT u.file_name, u.org_filename, u.document_id, u.document_name,
          m.eng_name as master_doc_name, m.upload_for as section_id,
          dt.eng_name as section_name
   FROM upload_docs u
   LEFT JOIN m_upload_docs m ON m.id = u.document_id
   LEFT JOIN m_document_type dt ON dt.id = m.upload_for
   WHERE u.application_id = $1 AND u.status = 1
   ORDER BY m.upload_for, m.id`,
  [applicationId]
);


    if (personalResult.rows.length === 0) {
      return json({ error: -1, errorMsg: 'Application not found' });
    }

    const docs = {};
    const allDocs = [];
    docsResult.rows.forEach(d => {
      docs[d.document_id] = d.file_name;

      // Named keys for photo (id:3) and signature (id:4)
      if (d.document_id === 3) docs['photo'] = d.file_name;
      if (d.document_id === 4) docs['signature'] = d.file_name;

      allDocs.push({
        file_name: d.file_name,
        org_filename: d.org_filename,
        document_id: d.document_id,
        document_name: d.master_doc_name || d.document_name || 'Document',
        section_id: d.section_id,
        section_name: d.section_name || 'Other Documents'
      });
    });

    const personal = personalResult.rows[0];
    personal.gender                  = genderMap[personal.gender]|| personal.gender;
    personal.religion                = religionMap[personal.religion]|| personal.religion;
    personal.marital_status          = maritalMap[personal.marital_status]|| personal.marital_status;
    personal.occupation              = occupationMap[personal.occupation]|| personal.occupation;
    personal.education_qualification = eduQualMap[personal.education_qualification]|| personal.education_qualification;
    personal.resident                = personal.resident === 1 ? 'Yes' : 'No';

    const education = educationResult.rows[0];
    education.course_type      = courseTypeMap[education.course_type]      || education.course_type;
    education.mode_of_study    = modeStudyMap[education.mode_of_study]     || education.mode_of_study;
    education.admission_status = admissionMap[education.admission_status]  || education.admission_status;
    education.purpose_of_loan  = purposeLoanMap[education.purpose_of_loan] || education.purpose_of_loan;

    const lics = licResult.rows.map(l => ({
    ...l,
    policy_type: policyTypeMap[l.policy_type] || l.policy_type
    }));

   // const unitsMap = { 1: 'Hectare', 2: 'Acre', 3: 'Guntha', 4: 'Sq. Ft.', 5: 'Sq. Meter' };

    const properties = propertyResult.rows.map(p => ({
      ...p,
      district_id: districtMap[p.district_id] || p.district_id,
      units: unitsMap[p.units] || p.units
    }));


    return json({
      error: 0,
      data: {
        personal: personal,
        education: education,
        guarantor: guarantorResult.rows[0] || null,
        collateral: {
          properties: properties,
          fds: fdResult.rows,
          lics: lics,
          govtEmployees: govtResult.rows
        },
        documents: docs,
        allDocs: allDocs
      }
    });

  } catch (err) {
    console.error('Error fetching application view:', err);
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}