import { json } from '@sveltejs/kit';
import pool from '$lib/db';

//1. Collateral Property

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


// collateral FD 

// Get all FD collaterals
async function getFDCollateralsQuery(client, applicationId) {
    const result = await client.query(
        `SELECT 
            id,
            application_id,
            bank_name,
            branch_name,
            street_address,
            district_id,
            taluka_id,
            place,
            pincode,
            fd_acc_no,
            fd_start_date,
            fd_maturity_date,
            interest_rate,
            amount
        FROM collateral_fd_information 
        WHERE application_id = $1
        ORDER BY id ASC`,
        [applicationId]
    );
    return result.rows;
}

// Insert FD collateral
async function insertFDCollateralQuery(client, applicationId, fdData) {
    const {
        bank_name,
        branch_name,
        street_address,
        district_id,
        taluka_id,
        place,
        pincode,
        fd_acc_no,
        fd_start_date,
        fd_maturity_date,
        interest_rate,
        amount
    } = fdData;

    const result = await client.query(
        `INSERT INTO collateral_fd_information (
            application_id,
            bank_name,
            branch_name,
            street_address,
            district_id,
            taluka_id,
            place,
            pincode,
            fd_acc_no,
            fd_start_date,
            fd_maturity_date,
            interest_rate,
            amount
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id`,
        [
            applicationId,
            bank_name,
            branch_name,
            street_address,
            district_id,
            taluka_id,
            place,
            pincode,
            fd_acc_no,
            fd_start_date,
            fd_maturity_date,
            interest_rate,
            amount
        ]
    );
    return result.rows[0].id;
}

//collateral lic 


// Get all LIC collaterals
async function getLICCollateralsQuery(client, applicationId) {
    const result = await client.query(
        `SELECT 
            id,
            application_id,
            policy_name,
            policy_type,
            policy_receipt_no,
            policy_surrender_value,
            policy_start_date,
            policy_maturity_date
        FROM collateral_lic_information 
        WHERE application_id = $1
        ORDER BY id ASC`,
        [applicationId]
    );
    return result.rows;
}

// Insert LIC collateral
async function insertLICCollateralQuery(client, applicationId, licData) {
    const {
        policy_name,
        policy_type,
        policy_receipt_no,
        policy_surrender_value,
        policy_start_date,
        policy_maturity_date
    } = licData;

    const result = await client.query(
        `INSERT INTO collateral_lic_information (
            application_id,
            policy_name,
            policy_type,
            policy_receipt_no,
            policy_surrender_value,
            policy_start_date,
            policy_maturity_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
        [
            applicationId,
            policy_name || null,
            policy_type,
            policy_receipt_no || null,
            policy_surrender_value,
            policy_start_date,
            policy_maturity_date
        ]
    );
    return result.rows[0].id;
}


async function getGovtCollateralsQuery(client, applicationId) {
    const result = await client.query(
        `SELECT 
            id,
            application_id,
            department_office_name,
            designation,
            employee_id_number,
            date_of_retirement,
            original_salary_certificate,
            office_identity_card,
            form_24b,
            permanent_government_employee
        FROM collateral_gov_information 
        WHERE application_id = $1
        ORDER BY id ASC`,
        [applicationId]
    );
    return result.rows;
}

async function insertGovtCollateralQuery(client, applicationId, govtData) {
    const {
        department_office_name,
        designation,
        employee_id_number,
        date_of_retirement,
        original_salary_certificate,
        office_identity_card,
        form_24b,
        permanent_government_employee
    } = govtData;

    const result = await client.query(
        `INSERT INTO collateral_gov_information (
            application_id,
            department_office_name,
            designation,
            employee_id_number,
            date_of_retirement,
            original_salary_certificate,
            office_identity_card,
            form_24b,
            permanent_government_employee
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`,
        [
            applicationId,
            department_office_name || null,
            designation || null,
            employee_id_number,
            date_of_retirement,
            original_salary_certificate,
            office_identity_card,
            form_24b,
            permanent_government_employee
        ]
    );
    return result.rows[0].id;
}

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

        if (action === 'getFDCollaterals') {
            const rows = await getFDCollateralsQuery(client, applicationId);

            const fdCollaterals = rows.map(row => ({
                id: row.id,
                type: 'fd',
                bankName: row.bank_name || '',
                branchName: row.branch_name || '',
                streetAddress: row.street_address || '',
                district: String(row.district_id),
                taluka: String(row.taluka_id),
                place: row.place || '',
                pinCode: row.pincode || '',
                fdAccountNumber: row.fd_acc_no || '',
                fdStartDate: row.fd_start_date
                    ? new Date(row.fd_start_date).toISOString().split('T')[0]
                    : '',
                fdMaturityDate: row.fd_maturity_date
                    ? new Date(row.fd_maturity_date).toISOString().split('T')[0]
                    : '',
                interestRate: String(row.interest_rate || ''),
                fdDepositAmount: String(row.amount)
            }));

            return json({ error: 0, fdCollaterals });
        }

        if (action === 'getLICCollaterals') {
            const rows = await getLICCollateralsQuery(client, applicationId);

            const licCollaterals = rows.map(row => ({
                id: row.id,
                type: 'lic',
                policyName: row.policy_name || '',
                policyType: String(row.policy_type),
                policyReceiptNo: row.policy_receipt_no || '',
                policySurrenderValue: String(row.policy_surrender_value),
                policyStartDate: row.policy_start_date
                    ? new Date(row.policy_start_date).toISOString().split('T')[0]
                    : '',
                policyMaturityDate: row.policy_maturity_date
                    ? new Date(row.policy_maturity_date).toISOString().split('T')[0]
                    : ''
            }));

            return json({ error: 0, licCollaterals });
        }

        if (action === 'getGovtCollaterals') {
            const rows = await getGovtCollateralsQuery(client, applicationId);

            const govtCollaterals = rows.map(row => ({
                id: row.id,
                type: 'govt-employee',
                departmentName: row.department_office_name || '',
                designation: row.designation || '',
                employeeID: row.employee_id_number || '',
                retirementDate: row.date_of_retirement
                    ? new Date(row.date_of_retirement).toISOString().split('T')[0]
                    : '',
                hasSalaryCertificate: row.original_salary_certificate,
                hasIdentityCard: row.office_identity_card,
                hasForm24B: row.form_24b,
                isPermanent: row.permanent_government_employee
            }));

            return json({ error: 0, govtCollaterals });
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
        const { action, properties, fdCollaterals,licCollaterals,govtCollaterals } = body;

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

        if (action === 'saveFDCollaterals') {
            if (!Array.isArray(fdCollaterals)) {
                await client.query('ROLLBACK');
                return json(
                    { error: -1, errorMsg: "fdCollaterals array is required" },
                    { status: 400 }
                );
            }

            // Delete all existing FD collaterals for this application
            await client.query(
                'DELETE FROM collateral_fd_information WHERE application_id = $1',
                [applicationId]
            );

            // Insert all new FD collaterals
            const savedIds = [];
            for (const fd of fdCollaterals) {
                const fdData = {
                    bank_name: fd.bankName,
                    branch_name: fd.branchName,
                    street_address: fd.streetAddress,
                    district_id: parseInt(fd.district),
                    taluka_id: parseInt(fd.taluka),
                    place: fd.place,
                    pincode: fd.pinCode,
                    fd_acc_no: fd.fdAccountNumber,
                    fd_start_date: fd.fdStartDate,
                    fd_maturity_date: fd.fdMaturityDate,
                    interest_rate: fd.interestRate ? parseFloat(fd.interestRate) : null,
                    amount: parseFloat(fd.fdDepositAmount)
                };

                const newId = await insertFDCollateralQuery(client, applicationId, fdData);
                savedIds.push(newId);
            }

            await client.query('COMMIT');

            return json({
                error: 0,
                errorMsg: "FD collaterals saved successfully",
                savedCount: savedIds.length
            });
        }

        if (action === 'saveLICCollaterals') {
            if (!Array.isArray(licCollaterals)) {
                await client.query('ROLLBACK');
                return json(
                    { error: -1, errorMsg: "licCollaterals array is required" },
                    { status: 400 }
                );
            }

            // Delete all existing LIC collaterals for this application
            await client.query(
                'DELETE FROM collateral_lic_information WHERE application_id = $1',
                [applicationId]
            );

            // Insert all new LIC collaterals
            const savedIds = [];
            for (const lic of licCollaterals) {
                const licData = {
                    policy_name: lic.policyName || null,
                    policy_type: parseInt(lic.policyType),
                    policy_receipt_no: lic.policyReceiptNo || null,
                    policy_surrender_value: parseFloat(lic.policySurrenderValue),
                    policy_start_date: lic.policyStartDate,
                    policy_maturity_date: lic.policyMaturityDate
                };

                const newId = await insertLICCollateralQuery(client, applicationId, licData);
                savedIds.push(newId);
            }

            await client.query('COMMIT');

            return json({
                error: 0,
                errorMsg: "LIC collaterals saved successfully",
                savedCount: savedIds.length
            });
        }

        if (action === 'saveGovtCollaterals') {
            if (!govtCollaterals || !Array.isArray(govtCollaterals)) {
                await client.query('ROLLBACK');
                return json(
                    { error: -1, errorMsg: "govtCollaterals array is required" },
                    { status: 400 }
                );
            }

            // Delete all existing govt collaterals for this application
            await client.query(
                'DELETE FROM collateral_gov_information WHERE application_id = $1',
                [applicationId]
            );

            // Insert all new govt collaterals
            const savedIds = [];
            for (const govt of govtCollaterals) {
                const govtData = {
                    department_office_name: govt.departmentName || null,
                    designation: govt.designation || null,
                    employee_id_number: govt.employeeID,
                    date_of_retirement: govt.retirementDate,
                    original_salary_certificate: govt.hasSalaryCertificate === true,
                    office_identity_card: govt.hasIdentityCard === true,
                    form_24b: govt.hasForm24B === true,
                    permanent_government_employee: govt.isPermanent === true
                };

                const newId = await insertGovtCollateralQuery(client, applicationId, govtData);
                savedIds.push(newId);
            }

            await client.query('COMMIT');

            return json({
                error: 0,
                errorMsg: "Govt collaterals saved successfully",
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