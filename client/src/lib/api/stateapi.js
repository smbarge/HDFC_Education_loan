// ─── Token helpers ────────────────────────────────

function getScrutinyToken() {
  if (typeof document === 'undefined') return '';
  return localStorage.getItem('scrutinyToken')
    || document.cookie.match(/(?:^|; )scrutinyTokenJS=([^;]*)/)?.[1]
    || '';
}

export function validateScrutinyToken(token) {
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

export function clearScrutinySession() {
  ['scrutinyToken', 'scrutinyTokenJS', 'scrutinyUsername'].forEach(name => {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Strict`;
  });
  localStorage.removeItem('scrutinyToken');
  localStorage.removeItem('scrutinyUsername');
}

export async function refreshScrutinyToken() {
  try {
    const response = await fetch('/api/scrutiny/auth', {
      method: 'GET',
      credentials: 'include'
    });
    const data = await response.json();
    if (data.error !== 0) return false;

    localStorage.setItem('scrutinyToken',   data.access_token);
    localStorage.setItem('scrutinyUsername', data.username || '');
    document.cookie = `scrutinyTokenJS=${data.access_token}; Path=/; SameSite=Strict; Max-Age=86400`;
    return true;
  } catch {
    return false;
  }
}

// ─── API functions ────────────────────────────────

export async function getStateApplicationsPaginated(page = 1, limit = 10) {
  const token = getScrutinyToken();
  try {
    const params = new URLSearchParams({ page, limit });
    const response = await fetch(`/api/scrutiny/applications?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    if (!response.ok || result.error !== 0) {
      return { error: 1, errorMsg: result.errorMsg || 'Failed to fetch applications' };
    }
    return { error: 0, ...result };
  } catch {
    return { error: 1, errorMsg: 'Server error' };
  }
}