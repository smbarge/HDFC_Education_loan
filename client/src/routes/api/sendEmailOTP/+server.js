// src/routes/api/sendEmailOTP/+server.js
import pkg from "pg";
const { Client } = pkg;
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import pool from "$lib/db";

// Function to get the current time in IST
function getISTTime() {
  const now = new Date();
  const istOffset = 5 * 60 + 30; // IST is UTC+5:30 in minutes
  const istTime = new Date(now.getTime() + istOffset * 60 * 1000);
  return istTime;
}

// Email transporter configuration
let transporter = nodemailer.createTransport({
  host: "email-smtp.ap-south-1.amazonaws.com", // AWS SES SMTP endpoint
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "AKIARSWCIJOZTTCUI7XB", // Your SMTP username
    pass: "BG05PhHQB/pSt+tGg7XACa473tOzpCE44hqMd7wSbnRF", // Your SMTP password
  },
});

export async function POST({ request }) {
  try {
    // Parse the incoming request body
    const { email, id, name } = await request.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: -1, errorMsg: "Email is required" }),
        { status: 400 }
      );
    }

    const createdAt = getISTTime();
    const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000); // 10 minutes

    // Generate UID and OTP
    const uid = uuidv4();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("Sending OTP to email:", email);
    console.log("Generated OTP:", otpCode);
    console.log("UID:", uid);

    // Email template
    let mailOptions = {
      from: "no-reply@mahaonline.gov.in",
      to: email,
      subject: "OTP for Email Verification - MAMFDC",
      text: `Hello ${name || 'User'}, Your Email Verification Code is ${otpCode}`,
      html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maulana Azad Minority Financial Development Corporation Limited</title>
    <style>
        @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
    </style>
</head>
<body class="bg-gray-100">
    <div class="max-w-lg mx-auto mt-8 bg-white shadow-md rounded-lg overflow-hidden">
        <div class="bg-blue-600 p-4 text-center text-white">
            <h2 class="text-xl font-semibold">Maulana Azad Minority Financial Development Corporation Limited</h2>
        </div>
        <div class="p-6 text-left">
            <p class="text-lg">Dear ${name || 'User'},</p>
            <p class="mt-4">Thank you for registering with our MAMFDC Portal! We're excited to have you on board.</p>
            <p class="mt-4">To complete the email verification process, please use the following Verification Code:</p>
            <div class="mt-6 mb-6 text-center">
                <span class="text-3xl font-bold bg-gray-200 text-gray-700 py-2 px-4 rounded">
                    ${otpCode}
                </span>
            </div>
            <p class="mt-4 text-sm text-gray-600">This OTP is valid for 10 minutes only.</p>
            <p class="mt-6">Best regards,<br>MAMFDC</p>
        </div>
        <div class="bg-gray-50 p-4 text-center text-sm text-gray-500 border-t">
            <p>Your security is our priority, and rest assured that this verification process is designed to keep your information safe.</p>
        </div>
        <div class="bg-gray-50 p-4 text-center text-sm text-gray-500 border-t">
            &copy; 2024 MAMFDC. All rights reserved.
        </div>
    </div>
</body>
</html>`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent successfully:", info.messageId);
      }
    });

    // Insert OTP into database
    const insertQuery = `
        INSERT INTO emailotp (id, uid, otp_code, email, created_at, expires_at, verified) 
        VALUES ($1, $2, $3, $4, $5, $6, false)
        `;
        await pool.query(insertQuery, [
        id,
        uid,
        otpCode,
        email,
        createdAt,
        expiresAt,
        ]);

    console.log("Email OTP record created - UID:", uid);

    return new Response(
      JSON.stringify({
        error: 0,
        errorMsg: "OTP sent to email successfully",
        uid: uid,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in sendEmailOTP endpoint:", error);
    return new Response(
      JSON.stringify({ 
        error: -1, 
        errorMsg: "An error occurred: " + error.message 
      }),
      { status: 500 }
    );
  }
}