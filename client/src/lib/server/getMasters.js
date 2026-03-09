import pool from '$lib/db.js';

export async function getMasters() {
    const [
        genderRes, religionRes, maritalRes, occupationRes, eduQualRes,
        courseTypeRes, modeStudyRes, admissionRes, purposeLoanRes,
        propertyTypeRes, policyTypeRes, districtRes, unitsRes
    ] = await Promise.all([
        pool.query(`SELECT id, eng_name FROM public.m_gender`),
        pool.query(`SELECT id, eng_name FROM public.m_religion`),
        pool.query(`SELECT id, eng_name FROM public.m_marital_status`),
        pool.query(`SELECT id, eng_name FROM public.m_occupation`),
        pool.query(`SELECT id, eng_name FROM public.m_educational_qualification`),
        pool.query(`SELECT course_id, eng_name FROM public.m_course_type`),
        pool.query(`SELECT id, eng_name FROM public.m_mode_of_study`),
        pool.query(`SELECT id, eng_name FROM public.m_admission_status`),
        pool.query(`SELECT id, eng_name FROM public.m_perpose_loan`),
        pool.query(`SELECT id, eng_name FROM public.m_property_type`),
        pool.query(`SELECT id, eng_name FROM public.m_policy_type`),
        pool.query(`SELECT dist_id, eng_name FROM public.m_district WHERE status = 1`),
        pool.query(`SELECT id, eng_name FROM public.m_units`)
    ]);

    return {
        genderMap:       Object.fromEntries(genderRes.rows.map(r => [r.id, r.eng_name])),
        religionMap:     Object.fromEntries(religionRes.rows.map(r => [r.id, r.eng_name])),
        maritalMap:      Object.fromEntries(maritalRes.rows.map(r => [r.id, r.eng_name])),
        occupationMap:   Object.fromEntries(occupationRes.rows.map(r => [r.id, r.eng_name])),
        eduQualMap:      Object.fromEntries(eduQualRes.rows.map(r => [r.id, r.eng_name])),
        courseTypeMap:   Object.fromEntries(courseTypeRes.rows.map(r => [r.course_id, r.eng_name])),
        modeStudyMap:    Object.fromEntries(modeStudyRes.rows.map(r => [r.id, r.eng_name])),
        admissionMap:    Object.fromEntries(admissionRes.rows.map(r => [r.id, r.eng_name])),
        purposeLoanMap:  Object.fromEntries(purposeLoanRes.rows.map(r => [r.id, r.eng_name])),
        propertyTypeMap: Object.fromEntries(propertyTypeRes.rows.map(r => [r.id, r.eng_name])),
        policyTypeMap:   Object.fromEntries(policyTypeRes.rows.map(r => [r.id, r.eng_name])),
        districtMap:     Object.fromEntries(districtRes.rows.map(r => [r.dist_id, r.eng_name])),
        unitsMap:        Object.fromEntries(unitsRes.rows.map(r => [r.id, r.eng_name]))
    };
}