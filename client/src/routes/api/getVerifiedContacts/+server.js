import { json } from '@sveltejs/kit';
import pool from '$lib/db';

export async function GET({ url }) {
    try {
        const applicationId = url.searchParams.get('applicationId');

        if (!applicationId) {
            return json(
                { error: -1, errorMsg: "Application ID is required" },
                { status: 400 }
            );
        }

        console.log("Fetching verified contacts for application:", applicationId);

        const result = await pool.query(
            `SELECT 
                mobile_no_applicant,
                email_id_applicant
             FROM contacts 
             WHERE id = $1`,
            [applicationId]
        );

        if (result.rows.length === 0) {
            return json({
                error: 0,
                errorMsg: "No contacts found",
                mobile: null,
                email: null
            });
        }

        const contact = result.rows[0];

        return json({
            error: 0,
            errorMsg: "Contacts fetched successfully",
            mobile: contact.mobile_no_applicant,
            email: contact.email_id_applicant
        });

    } catch (error) {
        console.error('Error fetching contacts:', error);
        return json(
            { error: -1, errorMsg: "Server error: " + error.message },
            { status: 500 }
        );
    }
}
