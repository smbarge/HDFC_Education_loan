import { json } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import pool from '$lib/db';

function getISTTime() {
    const now = new Date();
    const istOffset = 5 * 60 + 30; 
    const istTime = new Date(now.getTime() + istOffset * 60 * 1000);
    return istTime;
}

async function sendTemplatedSMS({ to, var1, var2 }) {
    const apiUrl = "https://push3.aclgateway.com/servlet/com.aclwireless.pushconnectivity.listeners.TextListener";
    const appId = "mitmamfdc";
    const userId = "mitmamfdc";
    const password = "mitm_01";
    const from = "MAHGOV";

    const templateMessage = `Dear ${var2}, your OTP for mobile number verification is ${var1}. Please enter this OTP to verify your mobile number. - MAHGOV`;

    try {
        const response = await axios.get(apiUrl, {
            params: {
                appid: appId,
                userId: userId,
                pass: password,
                contenttype: 1,
                from: from,
                to: to,
                text: templateMessage,
                alert: 1,
                selfid: true,
            },
        });

        console.log('SMS Sent:', response.data);
        return { success: true };
    } catch (error) {
        console.error('Error sending SMS:', error);
        return { success: false, error: error.message };
    }
}

export async function POST({ request }) {
    try {
        const { mobileNumber, id, name } = await request.json();

        if (!mobileNumber) {
            return json(
                { error: -1, errorMsg: "Mobile number is required" },
                { status: 400 }
            );
        }

        const uid = uuidv4();
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        console.log("Sending OTP to:", mobileNumber);
        console.log("Generated OTP:", otpCode);
        console.log("UID:", uid);

        const createdAt = getISTTime();
        const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000); // 10 minutes expiry

        const smsResult = await sendTemplatedSMS({
            to: mobileNumber,
            var1: otpCode,
            var2: name || 'User'
        });

        if (!smsResult.success) {
            console.log('SMS failed but continuing with OTP generation');
            // In development, you might want to continue even if SMS fails
            // return json(
            //     { error: -1, errorMsg: "Failed to send OTP via SMS" },
            //     { status: 500 }
            // );
        }

        if (id) {
            // Insert UID, OTP, created_at, and expires_at into the PostgreSQL table
            const insertQuery = `
            INSERT INTO otp (id,uid, otp_code, mobile, created_at, expires_at) 
            VALUES ($1, $2, $3, $4, $5,$6)
            `;
            await pool.query(insertQuery, [
                id,
                uid,
                otpCode,
                mobileNumber,
                createdAt,
                expiresAt,
            ]);
            } else {
            const insertQuery = `
            INSERT INTO otp (uid, otp_code, mobile, created_at, expires_at) 
            VALUES ($1, $2, $3, $4, $5)
            `;
            await pool.query(insertQuery, [
                uid,
                otpCode,
                mobileNumber,
                createdAt,
                expiresAt,
            ]);
            }
        
        // await pool.query(
        //     `INSERT INTO otp (uid, otp_code, mobile, created_at, expires_at, verified)
        //      VALUES ($1::uuid, $2, $3, $4, $5, false)`,
        //     [uid, otpCode, mobileNumber, createdAt, expiresAt]
        // );

        return json({
            error: 0,
            errorMsg: "OTP sent successfully",
            uid: uid
        });

    } catch (error) {
        console.error("Error in sendOTP endpoint:", error);
        return json(
            { error: -1, errorMsg: "An error occurred: " + error.message },
            { status: 500 }
        );
    }
}