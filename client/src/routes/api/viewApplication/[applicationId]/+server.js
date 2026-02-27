import { json } from '@sveltejs/kit';
import pool from '$lib/db';

export async function GET({ params }) {
    const client = await pool.connect();

    try {
        const { applicationId } = params;

        if (!applicationId) {
            return json({ error: -1, errorMsg: "Application ID required" });
        }

        // 1️⃣ Application
        const applicationRes = await client.query(
            `SELECT * FROM user_applications WHERE application_id = $1`,
            [applicationId]
        );

        // 2️⃣ Personal
        const personalRes = await client.query(
            `SELECT * FROM personal_details WHERE application_id = $1`,
            [applicationId]
        );

        // 3️⃣ Education
        const educationRes = await client.query(
            `SELECT * FROM education_details WHERE application_id = $1`,
            [applicationId]
        );

        // 4️⃣ Guarantor
        const guarantorRes = await client.query(
            `SELECT * FROM guarantor_personal_details WHERE id = $1`,
            [applicationId]
        );

        return json({
            error: 0,
            data: {
                application: applicationRes.rows[0] || null,
                personal: personalRes.rows[0] || null,
                education: educationRes.rows[0] || null,
                guarantor: guarantorRes.rows[0] || null
            }
        });

    } catch (err) {
        console.error(err);
        return json({ error: -2, errorMsg: err.message }, { status: 500 });
    } finally {
        client.release();
    }
}