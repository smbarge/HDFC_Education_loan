import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// ─── POST: Login ───────────────────────────────────────────────────────────
export async function POST({ request, cookies }) {
  const { username, password } = await request.json();

  const params = new URLSearchParams();
  params.append('client_id',     env.KEYCLOAK_CLIENT_ID);
  params.append('client_secret', env.KEYCLOAK_CLIENT_SECRET);
  params.append('grant_type',    'password');
  params.append('username',       username);
  params.append('password',       password);

  try {
    const response = await fetch(
      `${env.KEYCLOAK_URL}/realms/education-loan/protocol/openid-connect/token`,
      { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params }
    );
    const data = await response.json();

    if (!response.ok) {
      return json({ error: -1, errorMsg: data.error_description || 'Invalid credentials' }, { status: 401 });
    }

    const payload       = JSON.parse(Buffer.from(data.access_token.split('.')[1], 'base64').toString());
    const district      = payload.district || payload.given_name || username.replace('_admin', '');
    const adminUsername = payload.preferred_username || username;

    console.log('Login success — user:', adminUsername, '| district:', district);

    return json({
      error:         0,
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      district,
      username:      adminUsername
    }, { headers: buildCookieHeaders(data.access_token, data.refresh_token, district, adminUsername) });

  } catch (err) {
    console.error('Keycloak login error:', err);
    return json({ error: -1, errorMsg: 'Authentication server error' }, { status: 500 });
  }
}

// ─── GET: Refresh token ────────────────────────────────────────────────────
export async function GET({ cookies }) {

  // Read HttpOnly refresh token — only server can access this
  const refreshToken = cookies.get('adminRefreshToken');

  console.log('Refresh attempt — token found:', !!refreshToken);

  if (!refreshToken) {
    return json({ error: -1, errorMsg: 'No refresh token. Please login again.' }, { status: 401 });
  }

  const params = new URLSearchParams();
  params.append('client_id',     env.KEYCLOAK_CLIENT_ID);
  params.append('client_secret', env.KEYCLOAK_CLIENT_SECRET);
  params.append('grant_type',    'refresh_token');
  params.append('refresh_token',  refreshToken);

  try {
    const response = await fetch(
      `${env.KEYCLOAK_URL}/realms/education-loan/protocol/openid-connect/token`,
      { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params }
    );
    const data = await response.json();

    if (!response.ok) {
      console.warn('Refresh token rejected by Keycloak:', data.error_description);
      return json({ error: -1, errorMsg: 'Session expired. Please login again.' }, { status: 401 });
    }

    const payload       = JSON.parse(Buffer.from(data.access_token.split('.')[1], 'base64').toString());
    const district      = payload.district || payload.given_name || '';
    const adminUsername = payload.preferred_username || '';

    console.log('Token refreshed for:', adminUsername);

    return json({
      error:        0,
      access_token: data.access_token,
      district,
      username:     adminUsername
    }, { headers: buildCookieHeaders(data.access_token, data.refresh_token, district, adminUsername) });

  } catch (err) {
    console.error('Token refresh error:', err);
    return json({ error: -1, errorMsg: 'Refresh failed' }, { status: 500 });
  }
}

// ─── Shared helper — builds all 5 Set-Cookie headers ──────────────────────
function buildCookieHeaders(accessToken, refreshToken, district, username) {
  const isProduction = env.NODE_ENV === 'production';
  const secure       = isProduction ? '; Secure' : '';

  const headers = new Headers();

  // HttpOnly — server only, XSS safe, sent automatically with every request
  headers.append('Set-Cookie', `adminToken=${accessToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${secure}`);
  headers.append('Set-Cookie', `adminRefreshToken=${refreshToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${secure}`);

  // JS readable — frontend can read with document.cookie
  headers.append('Set-Cookie', `adminTokenJS=${accessToken}; Path=/; SameSite=Strict; Max-Age=86400${secure}`);
  headers.append('Set-Cookie', `adminDistrict=${district}; Path=/; SameSite=Strict; Max-Age=86400${secure}`);
  headers.append('Set-Cookie', `adminUsername=${username}; Path=/; SameSite=Strict; Max-Age=86400${secure}`);

  return headers;
}