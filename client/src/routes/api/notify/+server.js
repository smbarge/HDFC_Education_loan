import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';
import nodemailer from 'nodemailer';
import { verifyToken } from '$lib/jwtverify';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'erakshatas2003@gmail.com',
    pass: 'vzcwbjxoulrkqkyr',
  }
});

export async function POST({ request }) {

   const auth = verifyToken(request);
  if (!auth.success) {
      return json({ message: auth.message }, { status: 401 });
  }

  const { userId, applicationId } = await request.json();
  const client = await pool.connect();

   try {
    console.log('Notify called for applicationId:', applicationId);

    const contactResult = await client.query(
      `SELECT mobile_no_applicant, email_id_applicant FROM contacts WHERE id = $1`,
      [applicationId]
    );

    console.log('Contact result:', contactResult.rows);

    const nameResult = await client.query(
      `SELECT name FROM personal_details WHERE id = $1`,
      [applicationId]
    );

    console.log('Name result:', nameResult.rows);

    if (contactResult.rows.length === 0) {
      return json({ error: -1, errorMsg: 'Contacts not found for applicationId: ' + applicationId });
    }

    const { email_id_applicant, mobile_no_applicant } = contactResult.rows[0];
const applicantName = nameResult.rows[0]?.name || 'Applicant';

// Fallback: if contacts has no email, fetch from personal_details
let emailToUse = email_id_applicant;
if (!emailToUse) {
  const pdResult = await client.query(
    `SELECT email FROM personal_details WHERE id = $1`,
    [applicationId]
  );
  emailToUse = pdResult.rows[0]?.email || null;
}

console.log('Email to use:', emailToUse);

    if (emailToUse) {
      await transporter.sendMail({
        from: '"MAMFDC Education Loan" <erakshatas2003@gmail.com>',
        to: emailToUse,
        subject: `Application #${applicationId} Submitted Successfully`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #7c3aed; padding: 24px; border-radius: 8px 8px 0 0;">
              <h2 style="color: white; margin: 0;">Application Submitted Successfully</h2>
            </div>
            <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="color: #374151; font-size: 15px;">Dear <strong>${applicantName}</strong>,</p>
              <p style="color: #374151;">Your Education Loan Application has been <strong style="color: #16a34a;">successfully submitted</strong>.</p>
              <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">APPLICATION DETAILS</p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #374151; font-weight: bold;">Application ID</td>
                    <td style="padding: 6px 0; color: #7c3aed; font-weight: bold;">#${applicationId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #374151; font-weight: bold;">Applicant Name</td>
                    <td style="padding: 6px 0; color: #374151;">${applicantName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #374151; font-weight: bold;">Status</td>
                    <td style="padding: 6px 0; color: #16a34a; font-weight: bold;">Submitted — Under Review</td>
                  </tr>
                </table>
              </div>
              <p style="color: #374151;">Our team will review your application and contact you shortly.</p>
              <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
                Thank you,<br/>
                <strong>Maulana Azad Minorities Financial Development Corporation Limited</strong><br/>
                A Govt. of Maharashtra Undertaking
              </p>
            </div>
          </div>
        `
      });
    }

    return json({
      error: 0,
      errorMsg: 'Notification sent successfully',
      emailSent: !!emailToUse
    });

  } catch (err) {
    console.error('Notification error:', err);
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}