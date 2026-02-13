import { json } from '@sveltejs/kit';
import pool from '$lib/db';

export async function POST({ request }) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { userId } = await request.json();

        if (!userId) {
            await client.query('ROLLBACK');
            return json(
                { error: -1, errorMsg: "User ID is required" },
                { status: 400 }
            );
        }

        console.log("Creating new application for user_id:", userId);

        // Get user phone from user1 table
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

        // Get the max application_id
        const maxIdResult = await client.query(
            'SELECT MAX(application_id) as max_id FROM user_applications'
        );

        const maxId = maxIdResult.rows[0].max_id || 0;
        const newApplicationId = maxId + 1;

        console.log("New Application ID:", newApplicationId);

        // Insert new application
        await client.query(
            `INSERT INTO user_applications (application_id, user_id, "user")
             VALUES ($1, $2, $3)`,
            [newApplicationId, userId, userPhone]
        );

        await client.query(
        `INSERT INTO public.contacts (id, mobile_no_applicant)
        VALUES ($1, $2)
        ON CONFLICT (id) DO NOTHING`,
        [newApplicationId, userPhone]
        );

        await client.query('COMMIT');

        return json({
            error: 0,
            errorMsg: "Application created successfully",
            applicationId: newApplicationId
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating application:', error);
        return json(
            { error: -1, errorMsg: "Server error: " + error.message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}