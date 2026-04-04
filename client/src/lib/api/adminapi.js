// ─── Token helpers ────────────────────────────────────────────────────────────

// Read token once, prefer cookie (set by server), fall back to localStorage.
// Why two places? The HttpOnly cookie is the secure store. localStorage is the
// fallback for places where the cookie isn't available (e.g. cross-tab, SSR).
function getAdminToken() {
  if (typeof document === 'undefined') return '';
const fromCookie = document.cookie.match(/(?:^|; )adminTokenJS=([^;]*)/)?.[1];
  return fromCookie || localStorage.getItem('adminToken') || '';
}

function getCookieValue(name) {
  if (typeof document === 'undefined') return '';
  return document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1] || '';
}

// Client-side expiry check ONLY — this is a UX optimisation (redirect before
// wasting a network call). It does NOT verify the signature — only the server
// can do that using JWT_SECRET. Never trust this check for access control.
export function validateAdminToken(token) {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    return !(payload.exp && payload.exp < now);
  } catch {
    return false;
  }
}

export function clearAdminSession() {
  // Clear all four cookies by setting Max-Age=0
  ['adminToken', 'adminTokenJS', 'adminDistrict', 'adminUsername', 'adminRefreshToken'].forEach(name => {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Strict`;
  });
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminDistrict');
  localStorage.removeItem('adminUsername');
}

// Call GET /api/admin/auth to refresh using HttpOnly refresh token cookie
export async function refreshAdminToken() {
  try {
    const response = await fetch('/api/admin/auth', {
      method: 'GET',              // ← GET on same route
      credentials: 'include'     // sends HttpOnly adminRefreshToken cookie automatically
    });
    const data = await response.json();

    if (data.error !== 0) {
      console.warn('Refresh failed:', data.errorMsg);
      return false;
    }

    // Update localStorage with new token
    localStorage.setItem('adminToken',    data.access_token);
    localStorage.setItem('adminDistrict', data.district || '');
    localStorage.setItem('adminUsername', data.username || '');

    console.log('=== TOKEN REFRESHED ===');
    console.log('New token (first 50):', data.access_token.substring(0, 50) + '...');
    return true;

  } catch (err) {
    console.error('Refresh error:', err);
    return false;
  }
}

// ─── API functions ─────────────────────────────────────────────────────────────

export async function adminLogin(username, password) {
  const response = await fetch('/api/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // sends/receives cookies
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  if (data.error !== 0) throw new Error(data.errorMsg || 'Login failed');
  return data; // { error:0, access_token, refresh_token, district, username }
}

export async function getDistrictApplicationsPaginated(district, page = 1, limit = 10) {
  const token = getAdminToken(); // ← single helper, consistent everywhere
  try {
    const response = await fetch(
      `/api/admin/applications?district=${encodeURIComponent(district)}&page=${page}&limit=${limit}`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
    );
    const result = await response.json();
    if (!response.ok || result.error !== 0) {
      return { error: 1, errorMsg: result.errorMsg || 'Failed to fetch applications' };
    }
    return { error: 0, ...result };
  } catch (err) {
    return { error: 1, errorMsg: 'Server error' };
  }
}

export async function getCheckpoints() {
  const token = getAdminToken();
  try {
    const response = await fetch('/api/admin/checkpoints', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    return result.error === 0
      ? { error: 0, byDocument: result.byDocument || {} }
      : { error: 1, errorMsg: result.errorMsg, byDocument: {} };
  } catch {
    return { error: 1, errorMsg: 'Server error', byDocument: {} };
  }
}

export async function getVerificationAnswers(application_id) {
  const token = getAdminToken();
  try {
    const response = await fetch(`/api/admin/verification?application_id=${application_id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    });
    const result = await response.json();
    return result.error === 0
      ? { error: 0, answers: result.answers || {}, office_id: result.office_id, verification_id: result.verification_id }
      : { error: 1, answers: {} };
  } catch {
    return { error: 1, answers: {} };
  }
}

export async function saveAnswers({ application_id, answers, iteration = 1 }) {
  const token = getAdminToken();
  try {
    const response = await fetch('/api/admin/verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify({ action: 'saveAnswers', application_id, answers, iteration })
    });
    const result = await response.json();
    return result.error === 0
      ? { error: 0, verification_id: result.verification_id }
      : { error: 1, errorMsg: result.errorMsg };
  } catch {
    return { error: 1, errorMsg: 'Server error' };
  }
}

export async function submitDecision({ application_id, decision, remark, iteration = 1 }) {
  const token = getAdminToken();
  try {
    const response = await fetch('/api/admin/verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify({ action: 'finalDecision', application_id, decision, remark, iteration })
    });
    const result = await response.json();
    return result.error === 0
      ? { error: 0, ...result }
      : { error: 1, errorMsg: result.errorMsg };
  } catch {
    return { error: 1, errorMsg: 'Server error' };
  }
}

export async function loadAnswers(application_id) {
  return getVerificationAnswers(application_id); // same thing — remove the duplicate
}

// export {
  
// };