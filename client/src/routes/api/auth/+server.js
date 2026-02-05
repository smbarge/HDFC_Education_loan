import { json } from '@sveltejs/kit';
import pool from '$lib/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';

const JWT_SECRET = env.JWT_SECRET || 'your-secret-key-2024';

async function generateId() {
    const result = await pool.query(
        'SELECT MAX(id) as max_id FROM user1'
    );
    
    const maxId = result.rows[0].max_id || 0;
    return maxId + 1;
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    try {
        const action = url.searchParams.get('action');
        const mobile = url.searchParams.get('mobile');

        console.log('Auth API GET called with action:', action, 'mobile:', mobile);

        if (action === 'checkUser') {
            const result = await pool.query(
                'SELECT username FROM user1 WHERE mobile_no = $1',
                [mobile]
            );

            if (result.rows.length > 0) {
                return json({
                    error: 0,
                    errorMsg: 'User already exists'
                });
            } else {
                return json({
                    error: -1,
                    errorMsg: 'User not found'
                });
            }
        }

        return json({ 
            error: -1, 
            errorMsg: 'Invalid action: ' + action 
        });

    } catch (error) {
        console.error('Auth API GET error:', error);
        return json({
            error: -2,
            errorMsg: error.message || 'An error occurred'
        }, { status: 500 });
    }
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const body = await request.json();
        const { action } = body;

        console.log('Auth API POST called with action:', action);

        // REGISTER USER
        if (action === 'register') {
            const { mobile, name, password, otp } = body;

            console.log('Register request:', { mobile, name, hasPassword: !!password, otp });

            // Check if user already exists
            const existingUser = await pool.query(
                'SELECT username FROM user1 WHERE mobile_no = $1',
                [mobile]
            );

            if (existingUser.rows.length > 0) {
                return json({
                    error: -1,
                    errorMsg: 'Mobile number already registered. Please login.'
                });
            }

            // Verify OTP before creating user (only if otp is provided)
            if (otp) {
                const otpResult = await pool.query(
                    'SELECT * FROM otp WHERE mobile = $1 AND otp_code = $2 AND verified = true AND expires_at > NOW()',
                    [mobile, otp]
                );

                if (otpResult.rows.length === 0) {
                    return json({
                        error: -1,
                        errorMsg: 'Invalid or expired OTP'
                    });
                }
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = await generateId();
            const username = mobile;

            // Create user
            const result = await pool.query(
                `INSERT INTO user1 (id, full_name, username, mobile_no, password, created_at, updated_at) 
                 VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
                 RETURNING username, id`,
                [userId, name, username, mobile, hashedPassword]
            );

            console.log('User created successfully:', result.rows[0].username);

            return json({
                error: 0,
                errorMsg: 'User created successfully',
                username: result.rows[0].username,
                userId: result.rows[0].id
            });
        }

        // LOGIN USER
        if (action === 'login') {
            const { mobile, password } = body;

            console.log('Login attempt for mobile:', mobile);

            const result = await pool.query(
                'SELECT * FROM user1 WHERE mobile_no = $1',
                [mobile]
            );

            if (result.rows.length === 0) {
                return json({
                    error: -1,
                    errorMsg: 'Invalid mobile number or password'
                });
            }

            const user = result.rows[0];
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return json({
                    error: -1,
                    errorMsg: 'Invalid mobile number or password'
                });
            }

            console.log('Login successful for user:', user.username);

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    mobile: user.mobile_no,
                    sub: user.username
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            return json({
                error: 0,
                errorMsg: 'User login successfully',
                access_token: token,
                refresh_token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.full_name,
                    mobile: user.mobile_no,
                    given_name: user.full_name,
                    preferred_username: user.username
                }
            });
        }

        // GET USER BY MOBILE
        if (action === 'getUserByMobile') {
            const { mobile } = body;

            const result = await pool.query(
                'SELECT id, username, full_name FROM user1 WHERE mobile_no = $1',
                [mobile]
            );

            if (result.rows.length === 0) {
                return json({
                    error: -1,
                    errorMsg: 'User not found'
                });
            }

            const user = result.rows[0];
            return json({
                error: 0,
                errorMsg: 'User found',
                userId: user.id,
                username: user.username,
                name: user.full_name
            });
        }

        // CHANGE PASSWORD
        if (action === 'changePassword') {
            const { mobile, password } = body;

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await pool.query(
                'UPDATE user1 SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE mobile_no = $2 RETURNING username',
                [hashedPassword, mobile]
            );

            if (result.rows.length === 0) {
                return json({
                    error: -1,
                    errorMsg: 'User not found'
                });
            }

            return json({
                error: 0,
                errorMsg: 'Password changed successfully'
            });
        }

        return json({ 
            error: -1, 
            errorMsg: 'Invalid action: ' + action 
        });

    } catch (error) {
        console.error('Auth API POST error:', error);
        return json({
            error: -2,
            errorMsg: error.message || 'An error occurred'
        }, { status: 500 });
    }
}