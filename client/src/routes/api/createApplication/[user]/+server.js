import { json } from '@sveltejs/kit';
import pool from '$lib/db';
import { DateTime } from 'luxon';


// ADD GET HANDLER
export async function GET({ params, url }) {
    const client = await pool.connect();

    try {
        const { user } = params;
        const action = url.searchParams.get('action');

        //get Start page Data step 1
        if (action === 'getApplicationData') {
            const applicationId = user; 

            const result = await client.query(
                `SELECT 
                    religion,
                    district_id,
                    aadhar,
                    name,
                    dob,
                    gender,
                    resident,
                    concent_for_aadhar_verification
                FROM personal_details 
                WHERE id = $1`,
                [applicationId]
            );

            if (result.rows.length === 0) {
                return json({
                    error: -1,
                    errorMsg: "Application not found"
                });
            }

            const data = result.rows[0];

            return json({
                error: 0,
                data: {
                    community: data.religion || null,
                    district: String(data.district_id),
                    aadharNumber: data.aadhar,
                    fullName: data.name,
                    dateOfBirth: data.dob ? DateTime.fromJSDate(data.dob).toISODate() : '',
                    gender: data.gender,
                    isResident: data.resident === 1 ? 'Yes' : 'No',
                    consent: data.concent_for_aadhar_verification === 1
                }
            });
        }

        //get personal detail page data step 2
        if (action === 'getPersonalDetails') {
            const applicationId = user;

            const result = await client.query(
                `SELECT 
                    mobile,
                    email,
                    pan,
                    current_address,
                    current_district,
                    current_taluka,
                    current_place,
                    current_area,
                    current_pincode,
                    permanent_address,
                    permanent_district,
                    permanent_taluka,
                    permanent_place,
                    permanent_area,
                    permanent_pincode,
                    marital_status,
                    education_qualification,
                    guardian_name,
                    occupation,
                    income,
                    past_surety_commitment,
                    relation
                FROM personal_details 
                WHERE id = $1`,
                [applicationId]
            );

            if (result.rows.length === 0) {
                return json({
                    error: -1,
                    errorMsg: "Personal details not found"
                });
            }

            const data = result.rows[0];

            return json({
                error: 0,
                data: {
                    mobileNumber: data.mobile || '',
                    emailId: data.email || '',
                    panCard: data.pan || '',
                    currentStreetAddress: data.current_address || '',
                    currentDistrict: data.current_district ? String(data.current_district) : '',
                    currentTaluka: data.current_taluka || '',
                    currentPlace: data.current_place || '',
                    currentArea: data.current_area || '',
                    currentPinCode: data.current_pincode || '',
                    permanentStreetAddress: data.permanent_address || '',
                    permanentDistrict: data.permanent_district ? String(data.permanent_district) : '',
                    permanentTaluka: data.permanent_taluka || '',
                    permanentPlace: data.permanent_place || '',
                    permanentArea: data.permanent_area || '',
                    permanentPinCode: data.permanent_pincode || '',
                    maritalStatus: data.marital_status || '',
                    educationalQualification: data.education_qualification || '',
                    parentName: data.guardian_name || '',
                    occupation: data.occupation || '',
                    annualIncome: data.income || '',
                    previousSurety: data.past_surety_commitment || '',
                    relationship  : data.relation || ''
                }
            });
        }

        return json({
            error: -1,
            errorMsg: "Invalid action"
        });

    } catch (error) {
        console.error('Error in GET:', error);
        return json(
            { error: -2, errorMsg: "Server error: " + error.message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}


export async function POST({ request, params }) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { user } = params;
        const body = await request.json();
        const { action } = body;

        // Create New Application + Save Step 1 Data store 

        if (action === 'saveApplicationStart') {
            const { userId, stepData, applicationId: existingAppId } = body;

            if (!userId || !stepData) {
                await client.query('ROLLBACK');
                return json(
                    { error: -1, errorMsg: "User ID and step data are required" },
                    { status: 400 }
                );
            }

            //Chek the User is Presnet or Not
            const userResult = await client.query(
                'SELECT mobile_no FROM user1 WHERE id = $1',
                [userId]
            );

            if (userResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return json(
                    { error: -1, errorMsg: "User not found" },
                    { status: 404 }
                );
            }

            const userPhone = userResult.rows[0].mobile_no;

            let finalApplicationId;

            //Check if updating existing application
            if (existingAppId) {
                finalApplicationId = existingAppId;
                console.log("Updating existing Application ID:", finalApplicationId);
            } else {
                // Create new application ID
                const maxIdResult = await client.query(
                    'SELECT MAX(application_id) as max_id FROM user_applications'
                );
                const maxId = maxIdResult.rows[0].max_id || 0;
                finalApplicationId = maxId + 1;
                console.log("Creating new Application ID:", finalApplicationId);
            }

            console.log("For user:", user, "userId:", userId);

            // Map religion string to integer

            const {
                religion,
                district_id,
                aadhar,
                name,
                dob,
                gender,
                resident,
                concent_for_aadhar_verification
            } = stepData;

            const religionInt = religion || null;

            // Check if record exists in personal_details
            const existing = await client.query(
                'SELECT id FROM personal_details WHERE id = $1',
                [finalApplicationId]
            );

            if (existing.rows.length > 0) {
                // UPDATE existing
                await client.query(
                    `UPDATE personal_details SET
                        religion = $2,
                        district_id = $3,
                        aadhar = $4,
                        name = $5,
                        dob = $6,
                        gender = $7,
                        resident = $8,
                        concent_for_aadhar_verification = $9
                    WHERE id = $1`,
                    [
                        finalApplicationId,
                        religionInt,
                        district_id,
                        aadhar,
                        name,
                        dob,
                        gender,
                        resident,
                        concent_for_aadhar_verification
                    ]
                );
            } else {
                // INSERT new
                await client.query(
                    `INSERT INTO personal_details (
                        id,
                        religion,
                        district_id,
                        aadhar,
                        name,
                        dob,
                        gender,
                        resident,
                        concent_for_aadhar_verification
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        finalApplicationId,
                        religionInt,
                        district_id,
                        aadhar,
                        name,
                        dob,
                        gender,
                        resident,
                        concent_for_aadhar_verification
                    ]
                );
            }

            //insert into user_applications if NEW application
            if (!existingAppId) {
                await client.query(
                    `INSERT INTO user_applications (application_id, user_id, "user")
                    VALUES ($1, $2, $3)
                    ON CONFLICT DO NOTHING`,
                    [finalApplicationId, userId, userPhone]
                );

                await client.query(
                    `INSERT INTO public.contacts (id, mobile_no_applicant)
                    VALUES ($1, $2)
                    ON CONFLICT (id) DO NOTHING`,
                    [finalApplicationId, userPhone]
                );
            }

            await client.query('COMMIT');

            return json({
                error: 0,
                errorMsg: existingAppId ? "Application updated successfully" : "Application created successfully",
                applicationId: finalApplicationId,
                userId: userId
            });
        }

        // Save Personal Details step 2
        if (action === 'savePersonalDetails') {
            const { applicationId, personalDetails } = body;

             console.log('Received savePersonalDetails request:', {
                applicationId,
                personalDetails
            });

            if (!applicationId || !personalDetails) {
                await client.query('ROLLBACK');
                return json(
                { error: -1, errorMsg: "Application ID and personal details are required" },
                { status: 400 }
                );
            }
            const {
                mobile,
                email,
                pan,
                current_address,
                current_district,
                current_taluka,
                current_place,
                current_area,
                current_pincode,
                permanent_address,
                permanent_district,
                permanent_taluka,
                permanent_place,
                permanent_area,
                permanent_pincode,
                marital_status,
                education_qualification,
                guardian_name,
                occupation,
                income,
                past_surety_commitment,
                ration_card_number,
                past_surety_commitment_detail,
                occupationtype,
                riot_victim,
                natural_calamity_victim,
                disabled_person,
                guarantor,
                literate,
                details,
                relation
            } = personalDetails;

            // Check if record exists
            const existingPD = await client.query(
                'SELECT id FROM personal_details WHERE id = $1',
                [applicationId]
            );

            if (existingPD.rows.length > 0) {
                // UPDATE existing
                await client.query(
                    `UPDATE personal_details SET
                        mobile                        = $2,
                        email                         = $3,
                        pan                           = $4,
                        current_address               = $5,
                        current_district              = $6,
                        current_taluka                = $7,
                        current_place                 = $8,
                        current_area                  = $9,
                        current_pincode               = $10,
                        permanent_address             = $11,
                        permanent_district            = $12,
                        permanent_taluka              = $13,
                        permanent_place               = $14,
                        permanent_area                = $15,
                        permanent_pincode             = $16,
                        marital_status                = $17,
                        education_qualification       = $18,
                        guardian_name                 = $19,
                        occupation                    = $20,
                        income                        = $21,
                        past_surety_commitment        = $22,
                        ration_card_number            = $23,
                        past_surety_commitment_detail = $24,
                        occupationtype                = $25,
                        riot_victim                   = $26,
                        natural_calamity_victim       = $27,
                        disabled_person               = $28,
                        guarantor                     = $29,
                        literate                      = $30,
                        details                       = $31,
                        relation                      = $32
                    WHERE id = $1`,
                    [
                        applicationId,
                        mobile,
                        email,
                        pan                           || null,
                        current_address,
                        current_district,
                        current_taluka,
                        current_place,
                        current_area,
                        current_pincode,
                        permanent_address,
                        permanent_district,
                        permanent_taluka,
                        permanent_place,
                        permanent_area,
                        permanent_pincode,
                        marital_status,
                        education_qualification,
                        guardian_name,
                        occupation,
                        income,
                        past_surety_commitment,
                        ration_card_number            || null,
                        past_surety_commitment_detail || null,
                        occupationtype                || null,
                        riot_victim                   || 0,
                        natural_calamity_victim       || 0,
                        disabled_person               || 0,
                        guarantor                     || 0,
                        literate                      || 0,
                        details                       || null,
                        relation                      
                    ]
                );
            } else {
                // INSERT new
                await client.query(
                    `INSERT INTO personal_details (
                        id, mobile, email, pan,
                        current_address, current_district, current_taluka,
                        current_place, current_area, current_pincode,
                        permanent_address, permanent_district, permanent_taluka,
                        permanent_place, permanent_area, permanent_pincode,
                        marital_status, education_qualification,
                        guardian_name, occupation, income,
                        past_surety_commitment, ration_card_number,
                        past_surety_commitment_detail, occupationtype,
                        riot_victim, natural_calamity_victim,
                        disabled_person, guarantor, literate, details,relation
                    ) VALUES (
                        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
                        $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32
                    )`,
                    [
                        applicationId,
                        mobile,
                        email,
                        pan                           || null,
                        current_address,
                        current_district,
                        current_taluka,
                        current_place,
                        current_area,
                        current_pincode,
                        permanent_address,
                        permanent_district,
                        permanent_taluka,
                        permanent_place,
                        permanent_area,
                        permanent_pincode,
                        marital_status,
                        education_qualification,
                        guardian_name,
                        occupation,
                        income,
                        past_surety_commitment,
                        ration_card_number            || null,
                        past_surety_commitment_detail || null,
                        occupationtype                || null,
                        riot_victim                   || 0,
                        natural_calamity_victim       || 0,
                        disabled_person               || 0,
                        guarantor                     || 0,
                        literate                      || 0,
                        details                       || null,
                        relation
                    ]
                );
            }

            await client.query('COMMIT');

            return json({
                error: 0,
                errorMsg: "Personal details saved successfully",
                applicationId: applicationId
            });
        }

        await client.query('ROLLBACK');
        return json(
            { error: -1, errorMsg: "Invalid action" },
            { status: 400 }
        );

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in createApplication:', error);
        return json(
            { error: -2, errorMsg: "Server error: " + error.message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}