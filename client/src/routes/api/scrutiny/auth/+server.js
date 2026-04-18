import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// ─── GET: Refresh token ────────────────────────────────────────────────────
export async function GET({ cookies }) {

  const refreshToken = cookies.get('scrutinyRefreshToken');

  console.log('Scrutiny refresh attempt — token found:', !!refreshToken);

  if (!refreshToken) {
    return json({ error: -1, errorMsg: 'No refresh token. Please login again.' }, { status: 401 });
  }

  const params = new URLSearchParams();
  params.append('client_id',     env.KEYCLOAK_CLIENT_ID_1);
  params.append('client_secret', env.KEYCLOAK_CLIENT_SECRET_1);
  params.append('grant_type',    'refresh_token');
  params.append('refresh_token',  refreshToken);

  try {
    const response = await fetch(
      `${env.KEYCLOAK_URL}/realms/education-loan/protocol/openid-connect/token`,
      { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params }
    );
    const data = await response.json();

    if (!response.ok) {
      console.warn('Scrutiny refresh token rejected by Keycloak:', data.error_description);
      return json({ error: -1, errorMsg: 'Session expired. Please login again.' }, { status: 401 });
    }

    const payload          = JSON.parse(Buffer.from(data.access_token.split('.')[1], 'base64').toString());
    const scrutinyUsername = payload.preferred_username || '';

    console.log('Scrutiny token refreshed for:', scrutinyUsername);



    return json({
      error:        0,
      access_token: data.access_token,
      username:     scrutinyUsername
    }, { headers: buildCookieHeaders(data.access_token, data.refresh_token, scrutinyUsername) });

  } catch (err) {
    console.error('Scrutiny token refresh error:', err);
    return json({ error: -1, errorMsg: 'Refresh failed' }, { status: 500 });
  }
}

// ─── POST: Login ───────────────────────────────────────────────────────────
export async function POST({ request, cookies }) {
  const { username, password } = await request.json();

  const params = new URLSearchParams();
  params.append('client_id',     env.KEYCLOAK_CLIENT_ID_1);
  params.append('client_secret', env.KEYCLOAK_CLIENT_SECRET_1);
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

    const payload          = JSON.parse(Buffer.from(data.access_token.split('.')[1], 'base64').toString());
    const scrutinyUsername = payload.preferred_username || '';
    const roles            = payload.realm_access?.roles || [];

    // Case-sensitive username check — submitted must exactly match JWT
    if (username !== scrutinyUsername) {
      console.warn('Login blocked — username case mismatch. Submitted:', username, '| Actual:', scrutinyUsername);
      return json({ error: -1, errorMsg: 'Invalid credentials.' }, { status: 401 });
    }

    //  Role check — must have state-scrutiny role
    if (!roles.includes('state-scrutiny')) {
      console.warn('Login blocked — user lacks state-scrutiny role:', scrutinyUsername, '| roles:', roles);
      return json({ error: -1, errorMsg: 'Access denied. Insufficient permissions.' }, { status: 403 });
    }

    const role = 'state-scrutiny';

    console.log('Scrutiny login success — user:', scrutinyUsername, '| role:', role);

    return json({
      error:         0,
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      username:      scrutinyUsername,
      role
    }, { headers: buildCookieHeaders(data.access_token, data.refresh_token, scrutinyUsername) });

  } catch (err) {
    console.error('Keycloak scrutiny login error:', err);
    return json({ error: -1, errorMsg: 'Authentication server error' }, { status: 500 });
  }
}

// ─── Shared helper — builds all Set-Cookie headers ────────────────────────
function buildCookieHeaders(accessToken, refreshToken, username) {
  const isProduction = env.NODE_ENV === 'production';
  const secure       = isProduction ? '; Secure' : '';

  const headers = new Headers();

  // HttpOnly — server only, XSS safe, sent automatically with every request
  headers.append('Set-Cookie', `scrutinyToken=${accessToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${secure}`);
  headers.append('Set-Cookie', `scrutinyRefreshToken=${refreshToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${secure}`);

  // JS readable — frontend reads these via document.cookie
  headers.append('Set-Cookie', `scrutinyTokenJS=${accessToken}; Path=/; SameSite=Strict; Max-Age=86400${secure}`);
  headers.append('Set-Cookie', `scrutinyUsername=${username}; Path=/; SameSite=Strict; Max-Age=86400${secure}`);

  return headers;
}