import { json } from '@sveltejs/kit';
import pool from '$lib/db';
import { DateTime } from 'luxon';

// ==================== QUERY FUNCTIONS ====================

// Get guarantor details
async function getGuarantorDetailsQuery(client, applicationId) {
    const result = await client.query(
        `SELECT 
            name,
            dob,
            gender,
            aadhar,
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
            occupation,
            income,
            past_surety_commitment
        FROM guarantor_personal_details 
        WHERE id = $1`,
        [applicationId]
    );
    return result.rows;
}

// Check if guarantor details exist
async function checkGuarantorDetailsExistsQuery(client, applicationId) {
    const result = await client.query(
        'SELECT id FROM guarantor_personal_details WHERE id = $1',
        [applicationId]
    );
    return result.rows;
}

// Insert guarantor details
async function insertGuarantorDetailsQuery(client, applicationId, guarantorDetails) {
    const {
        name,
        dob,
        gender,
        aadhar,
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
        occupation,
        income,
        past_surety_commitment
    } = guarantorDetails;

    await client.query(
        `INSERT INTO guarantor_personal_details (
            id,
            name,
            dob,
            gender,
            aadhar,
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
            occupation,
            income,
            past_surety_commitment
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`,
        [
            applicationId,
            name,
            dob,
            gender,
            aadhar || null,
            mobile,
            email || null,
            pan || null,
            current_address,
            current_district,
            current_taluka,
            current_place,
            current_area,
            current_pincode || null,
            permanent_address,
            permanent_district,
            permanent_taluka,
            permanent_place,
            permanent_area,
            permanent_pincode || null,
            marital_status,
            education_qualification,
            occupation,
            income,
            past_surety_commitment
        ]
    );
}

// Update guarantor details
async function updateGuarantorDetailsQuery(client, applicationId, guarantorDetails) {
    const {
        name,
        dob,
        gender,
        aadhar,
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
        occupation,
        income,
        past_surety_commitment
    } = guarantorDetails;

    await client.query(
        `UPDATE guarantor_personal_details SET
            name = $2,
            dob = $3,
            gender = $4,
            aadhar = $5,
            mobile = $6,
            email = $7,
            pan = $8,
            current_address = $9,
            current_district = $10,
            current_taluka = $11,
            current_place = $12,
            current_area = $13,
            current_pincode = $14,
            permanent_address = $15,
            permanent_district = $16,
            permanent_taluka = $17,
            permanent_place = $18,
            permanent_area = $19,
            permanent_pincode = $20,
            marital_status = $21,
            education_qualification = $22,
            occupation = $23,
            income = $24,
            past_surety_commitment = $25,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1`,
        [
            applicationId,
            name,
            dob,
            gender,
            aadhar || null,
            mobile,
            email || null,
            pan || null,
            current_address,
            current_district,
            current_taluka,
            current_place,
            current_area,
            current_pincode || null,
            permanent_address,
            permanent_district,
            permanent_taluka,
            permanent_place,
            permanent_area,
            permanent_pincode || null,
            marital_status,
            education_qualification,
            occupation,
            income,
            past_surety_commitment
        ]
    );
}

//API 

// GET
export async function GET({ params, url }) {
    const client = await pool.connect();

    try {
        const { user } = params;
        const action = url.searchParams.get('action');

        if (action === 'getGuarantorDetails') {
            const rows = await getGuarantorDetailsQuery(client, user);
            
            if (rows.length === 0) {
                return json({
                    error: -1,
                    errorMsg: "Guarantor details not found"
                });
            }

            const data = rows[0];
            return json({
                error: 0,
                data: {
                    guarantorFullName: data.name || '',
                    guarantorDOB: data.dob ? DateTime.fromJSDate(data.dob).toISODate() : '',
                    guarantorGender: data.gender || '',
                    guarantorAadhar: data.aadhar || '',
                    guarantorMobile: data.mobile || '',
                    guarantorEmail: data.email || '',
                    guarantorPAN: data.pan || '',
                    currentStreetAddress: data.current_address || '',
                    currentDistrict: data.current_district ? String(data.current_district) : '',
                    currentTaluka: data.current_taluka ? String(data.current_taluka) : '',
                    currentPlace: data.current_place || '',
                    currentArea: data.current_area || '',
                    currentPinCode: data.current_pincode || '',
                    permanentStreetAddress: data.permanent_address || '',
                    permanentDistrict: data.permanent_district ? String(data.permanent_district) : '',
                    permanentTaluka: data.permanent_taluka ? String(data.permanent_taluka) : '',
                    permanentPlace: data.permanent_place || '',
                    permanentArea: data.permanent_area || '',
                    permanentPinCode: data.permanent_pincode || '',
                    maritalStatus: data.marital_status || '',
                    educationalQualification: data.education_qualification || '',
                    guardianOccupation: data.occupation || '',
                    annualIncome: data.income || '',
                    previousSurety: data.past_surety_commitment || ''
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

// POST
export async function POST({ request, params }) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const body = await request.json();
        const { action } = body;

        if (action === 'saveGuarantorDetails') {
            const { applicationId, guarantorDetails } = body;

            // console.log('Received saveGuarantorDetails request:', {
            //     applicationId,
            //     guarantorDetails
            // });

            if (!applicationId || !guarantorDetails) {
                await client.query('ROLLBACK');
                return json(
                    { error: -1, errorMsg: "Application ID and guarantor details are required" },
                    { status: 400 }
                );
            }

            const existingRows = await checkGuarantorDetailsExistsQuery(client, applicationId);

            if (existingRows.length > 0) {
                await updateGuarantorDetailsQuery(client, applicationId, guarantorDetails);
            } else {
                await insertGuarantorDetailsQuery(client, applicationId, guarantorDetails);
            }

            await client.query('COMMIT');

            return json({
                error: 0,
                errorMsg: "Guarantor details saved successfully",
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
        console.error('Error in guarantorDetails:', error);
        return json(
            { error: -2, errorMsg: "Server error: " + error.message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}