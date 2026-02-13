// src/routes/api/verifyEmailOTP/+server.js
import { json } from "@sveltejs/kit";
import pkg from "pg";
import pool from "$lib/db";

function getISTTime() {
  const now = new Date();
  const istOffset = 5 * 60 + 30; // IST is UTC+5:30 in minutes
  const istTime = new Date(now.getTime() + istOffset * 60 * 1000);
  return istTime;
}

export async function POST({ request }) {
  const client = await pool.connect(); // Get a client for the transaction

  try {
    // Start a transaction
    await client.query("BEGIN");

    // Parse the request body
    const { uid, otp: otp_code, dataName } = await request.json();
    
    console.log("Verifying Email OTP - UID:", uid, "OTP:", otp_code);

    // Validate request data
    if (!uid || !otp_code) {
      await client.query("ROLLBACK");
      return json(
        { error: -1, errorMsg: "UID and OTP code are required." },
        { status: 400 }
      );
    }

    const createdAt = getISTTime();

    // Query the OTP record from the database
    const result = await client.query(
      "SELECT * FROM emailotp WHERE uid = $1 AND otp_code = $2 FOR UPDATE",
      [uid, otp_code]
    );

    // If OTP not found
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return json(
        { error: -1, errorMsg: "Invalid OTP." }, 
        { status: 400 }
      );
    }

    const otpRecord = result.rows[0];

    // Check if the OTP is expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      await client.query("ROLLBACK");
      return json(
        { error: -2, errorMsg: "OTP expired." }, 
        { status: 400 }
      );
    }

    // Check if OTP has already been verified
    if (otpRecord.verified) {
      await client.query("ROLLBACK");
      return json(
        { error: -3, errorMsg: "OTP already verified." },
        { status: 400 }
      );
    }

    // Mark OTP as verified and update the verified_at timestamp
    await client.query(
      "UPDATE emailotp SET verified = TRUE, verified_at = $2 WHERE uid = $1",
      [uid, createdAt]
    );

    console.log("Email OTP verified for ID:", otpRecord.id);

    // If dataName is provided, update contacts table
   if (dataName && otpRecord.id) {
      await client.query(
        `INSERT INTO contacts (id, email_id_${dataName})
         VALUES ($1, $2)
         ON CONFLICT (id)
         DO UPDATE SET email_id_${dataName} = EXCLUDED.email_id_${dataName}`,
        [otpRecord.id, otpRecord.email]  // otpRecord.id is applicationId
      );
    }

    // Commit the transaction
    await client.query("COMMIT");

    // Return success response
    return json({ 
      error: 0, 
      errorMsg: "Email verified successfully",
      email: otpRecord.email 
    });
    
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback the transaction on error
    console.error("Error verifying email OTP:", error);
    return json(
      { error: -1, errorMsg: "Server error: " + error.message }, 
      { status: 500 }
    );
  } finally {
    client.release(); // Release the client back to the pool
  }
}