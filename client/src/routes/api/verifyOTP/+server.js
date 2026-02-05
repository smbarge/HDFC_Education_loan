import { json } from '@sveltejs/kit';
import pool from '$lib/db';

export async function POST({ request }) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { uid, otp: otp_code } = await request.json();
        
        console.log("Verifying OTP - UID:", uid, "OTP:", otp_code);

        if (!uid || !otp_code) {
            await client.query('ROLLBACK');
            return json(
                { error: -1, errorMsg: "UID and OTP code are required" },
                { status: 400 }
            );
        }

        const result = await client.query(
            'SELECT * FROM otp WHERE uid = $1::uuid AND otp_code = $2 FOR UPDATE',
            [uid, otp_code]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return json(
                { error: -1, errorMsg: "Invalid OTP" },
                { status: 400 }
            );
        }

        const otpRecord = result.rows[0];

        if (new Date(otpRecord.expires_at) < new Date()) {
            await client.query('ROLLBACK');
            return json(
                { error: -2, errorMsg: "OTP expired" },
                { status: 400 }
            );
        }

        if (otpRecord.verified) {
            await client.query('ROLLBACK');
            return json(
                { error: -3, errorMsg: "OTP already verified" },
                { status: 400 }
            );
        }

        await client.query(
            'UPDATE otp SET verified = TRUE, verified_at = NOW() WHERE uid = $1::uuid',
            [uid]
        );

        await client.query('COMMIT');

        return json({
            error: 0,
            errorMsg: "OTP verified successfully",
            mobile: otpRecord.mobile
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error verifying OTP:', error);
        return json(
            { error: -1, errorMsg: "Server error: " + error.message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}