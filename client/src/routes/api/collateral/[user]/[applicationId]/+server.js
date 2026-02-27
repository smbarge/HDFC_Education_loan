import { json } from '@sveltejs/kit';
import pool from '$lib/db';

// ==================== QUERY FUNCTIONS ====================

// Get all collateral properties for an application
async function getCollateralPropertiesQuery(client, applicationId) {
    const result = await client.query(
        `SELECT 
            id,
            property_type,
            document_type,
            survey_no,
            district_id,
            taluka_id,
            place,
            pincode,
            units,
            area_value,
            gunta,
            property_value
        FROM collateral_property_information 
        WHERE application_id = $1
        ORDER BY id ASC`,
        [applicationId]
    );
    return result.rows;
}

// Insert new collateral property
async function insertCollateralPropertyQuery(client, applicationId, propertyData) {
    const {
        property_type,
        document_type,
        survey_no,
        district_id,
        taluka_id,
        place,
        pincode,
        units,
        area_value,
        gunta,
        property_value
    } = propertyData;

    const result = await client.query(
        `INSERT INTO collateral_property_information (
            application_id,
            property_type,
            document_type,
            survey_no,
            district_id,
            taluka_id,
            place,
            pincode,
            units,
            area_value,
            gunta,
            property_value
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id`,
        [
            applicationId,
            property_type,
            document_type,
            survey_no || null,
            district_id,
            taluka_id,
            place || null,
            pincode || null,
            units,
            area_value,
            gunta,
            property_value
        ]
    );
    return result.rows[0].id;
}

// Update existing collateral property
async function updateCollateralPropertyQuery(client, propertyId, applicationId, propertyData) {
    const {
        property_type,
        document_type,
        survey_no,
        district_id,
        taluka_id,
        place,
        pincode,
        units,
        area_value,
        gunta,
        property_value
    } = propertyData;

    await client.query(
        `UPDATE collateral_property_information SET
            property_type = $3,
            document_type = $4,
            survey_no = $5,
            district_id = $6,
            taluka_id = $7,
            place = $8,
            pincode = $9,
            units = $10,
            area_value = $11,
            gunta = $12,
            property_value = $13
        WHERE id = $1 AND application_id = $2`,
        [
            propertyId,
            applicationId,
            property_type,
            document_type,
            survey_no || null,
            district_id,
            taluka_id,
            place || null,
            pincode || null,
            units,
            area_value,
            gunta,
            property_value
        ]
    );
}

// Delete collateral property
async function deleteCollateralPropertyQuery(client, propertyId, applicationId) {
    await client.query(
        `DELETE FROM collateral_property_information 
        WHERE id = $1 AND application_id = $2`,
        [propertyId, applicationId]
    );
}

// ==================== API HANDLERS ====================

// GET
export async function GET({ params, url }) {
    const client = await pool.connect();

    try {
        const { applicationId } = params;
        const action = url.searchParams.get('action');

        if (action === 'getCollateralProperties') {

        const rows = await getCollateralPropertiesQuery(client, applicationId);

        // Transform to frontend format
        const properties = rows.map(row => ({
            id: row.id,
            type: 'property',
            propertyType: String(row.property_type),
            documentType: String(row.document_type),
            surveyNo: row.survey_no || '',
            district: String(row.district_id),
            taluka: String(row.taluka_id),
            village: row.place || '',
            pinCode: row.pincode || '',
            units: String(row.units),
            hectares: String(row.area_value),
            rGuntha: String(row.gunta),
            propertyValue: String(row.property_value)
        }));

        return json({
            error: 0,
            properties
        });

     } 

      return json({
            error: -1,
            errorMsg: "Invalid action"
        });

    } catch (error) {
        console.error('Error in GET collateral:', error);
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

        const { applicationId } = params;
        const body = await request.json();
        const { action, properties } = body;

        console.log('Received collateral request:', { action, applicationId, propertiesCount: properties?.length });

        if (action === 'saveCollateralProperties') {
            if (!Array.isArray(properties)) {
                await client.query('ROLLBACK');
                return json(
                    { error: -1, errorMsg: "Properties array is required" },
                    { status: 400 }
                );
            }

            // Delete all existing properties for this application
            await client.query(
                'DELETE FROM collateral_property_information WHERE application_id = $1',
                [applicationId]
            );

            // Insert all new properties
            const savedIds = [];
            for (const property of properties) {
                const propertyData = {
                    property_type: parseInt(property.propertyType),
                    document_type: parseInt(property.documentType),
                    survey_no: property.surveyNo || null,
                    district_id: parseInt(property.district),
                    taluka_id: parseInt(property.taluka),
                    place: property.village || null,
                    pincode: property.pinCode || null,
                    units: parseInt(property.units),
                    area_value: parseFloat(property.hectares),
                    gunta: parseFloat(property.rGuntha),
                    property_value: parseInt(property.propertyValue)
                };

                const newId = await insertCollateralPropertyQuery(client, applicationId, propertyData);
                savedIds.push(newId);
            }

            await client.query('COMMIT');

            return json({
                error: 0,
                errorMsg: "Collateral properties saved successfully",
                savedCount: savedIds.length
            });
        }

        await client.query('ROLLBACK');
        return json(
            { error: -1, errorMsg: "Invalid action" },
            { status: 400 }
        );

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in collateral POST:', error);
        return json(
            { error: -2, errorMsg: "Server error: " + error.message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}