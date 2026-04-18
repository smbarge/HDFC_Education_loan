// ─── Token helpers ────────────────────────────────

// function getAdminToken() {
//   if (typeof document === 'undefined') return '';
// const fromCookie = document.cookie.match(/(?:^|; )adminTokenJS=([^;]*)/)?.[1];
//   return fromCookie || localStorage.getItem('adminToken') || '';
// }

function getAdminToken() {
  if (typeof document === 'undefined') return '';
  return localStorage.getItem('adminToken') 
    || document.cookie.match(/(?:^|; )adminTokenJS=([^;]*)/)?.[1] 
    || '';
}

function getCookieValue(name) {
  if (typeof document === 'undefined') return '';
  return document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1] || '';
}


function validateAdminToken(token) {
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

function clearAdminSession() {
  // Clear all four cookies by setting Max-Age=0
  ['adminToken', 'adminTokenJS', 'adminDistrict', 'adminUsername', 'adminRefreshToken'].forEach(name => {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Strict`;
  });
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminDistrict');
  localStorage.removeItem('adminUsername');
}

// refresh using HttpOnly refresh token cookie
async function refreshAdminToken() {
  try {
    const response = await fetch('/api/admin/auth', {
      method: 'GET',
      credentials: 'include'
    });
    const data = await response.json();

    if (data.error !== 0) {
      console.warn('Refresh failed:', data.errorMsg);
      return false;
    }

    // Update localStorage
    localStorage.setItem('adminToken',    data.access_token);
    localStorage.setItem('adminDistrict', data.district || '');
    localStorage.setItem('adminUsername', data.username || '');

    //refresh the cookies refresh
    document.cookie = `adminTokenJS=${data.access_token}; Path=/; SameSite=Strict; Max-Age=86400`;

    console.log('=== TOKEN REFRESHED ===');
    return true;

  } catch (err) {
    console.error('Refresh error:', err);
    return false;
  }
}

// ─── API functions ────────────────────────

async function adminLogin(username, password) {
  const response = await fetch('/api/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', 
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  if (data.error !== 0) throw new Error(data.errorMsg || 'Login failed');
  return data; // { error:0, access_token, refresh_token, district, username }
}

async function getDistrictApplicationsPaginated(district, page = 1, limit = 10) {
  const token = getAdminToken();
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

// async function getCheckpoints() {
//   const token = getAdminToken();
//   try {
//     const response = await fetch('/api/admin/checkpoints', {
//       headers: { 'Authorization': `Bearer ${token}` }
//     });
//     const result = await response.json();
//     return result.error === 0
//       ? { error: 0, byDocument: result.byDocument || {} }
//       : { error: 1, errorMsg: result.errorMsg, byDocument: {} };
//   } catch {
//     return { error: 1, errorMsg: 'Server error', byDocument: {} };
//   }
// }

async function getCheckpoints() {
  try {
    const token = getAdminToken();
    const response = await fetch('/api/admin/checkpoints', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    if (!response.ok || result.error !== 0) {
      return { error: 1, errorMsg: result.errorMsg || 'Failed to fetch checkpoints', byDocument: {} };
    }
    return { error: 0, byDocument: result.byDocument || {} };
  } catch (err) {
    return { error: 1, errorMsg: 'Server error', byDocument: {} };
  }
}

// async function getVerificationAnswers(application_id) {
//   const token = getAdminToken();
//   try {
//     const response = await fetch(`/api/admin/verification?application_id=${application_id}`, {
//       headers: { 'Authorization': `Bearer ${token}` },
//       credentials: 'include'
//     });
//     const result = await response.json();
//     return result.error === 0
//       ? { error: 0, answers: result.answers || {}, office_id: result.office_id, verification_id: result.verification_id }
//       : { error: 1, answers: {} };
//   } catch {
//     return { error: 1, answers: {} };
//   }
// }


async function getVerificationAnswers(application_id) {
  try {
    const token = getAdminToken();
    const response = await fetch(`/api/admin/verification?application_id=${application_id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    });
    const result = await response.json();
    return result.error === 0
      ? { error: 0, answers: result.answers || {}, office_id: result.office_id, verification_id: result.verification_id }
      : { error: 1, answers: {} };
  } catch (err) {
    return { error: 1, answers: {} };
  }
}

// async function saveAnswers({ application_id, answers, iteration = 1 }) {
//   const token = getAdminToken();
//   try {
//     const response = await fetch('/api/admin/verification', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//       credentials: 'include',
//       body: JSON.stringify({ action: 'saveAnswers', application_id, answers, iteration })
//     });
//     const result = await response.json();
//     return result.error === 0
//       ? { error: 0, verification_id: result.verification_id }
//       : { error: 1, errorMsg: result.errorMsg };
//   } catch {
//     return { error: 1, errorMsg: 'Server error' };
//   }
// }


async function saveAnswers({ application_id, answers, iteration = 1 }) {
  try {
    const token = getAdminToken();
    const response = await fetch('/api/admin/verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({ action: 'saveAnswers', application_id, answers, iteration })
    });
    const result = await response.json();
    return result.error === 0
      ? { error: 0, verification_id: result.verification_id }
      : { error: 1, errorMsg: result.errorMsg };
  } catch (err) {
    return { error: 1, errorMsg: 'Server error' };
  }
}

// async function submitDecision({ application_id, decision, remark, iteration = 1 }) {
//   const token = getAdminToken();
//   try {
//     const response = await fetch('/api/admin/verification', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//       credentials: 'include',
//       body: JSON.stringify({ action: 'finalDecision', application_id, decision, remark, iteration })
//     });
//     const result = await response.json();
//     return result.error === 0
//       ? { error: 0, ...result }
//       : { error: 1, errorMsg: result.errorMsg };
//   } catch {
//     return { error: 1, errorMsg: 'Server error' };
//   }
// }

// async function submitDecision({ application_id, decision, remark, iteration = 1 }) {
//   try {
//     const token = getAdminToken();
//     const response = await fetch('/api/admin/verification', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       credentials: 'include',
//       body: JSON.stringify({ action: 'finalDecision', application_id, decision, remark, iteration })
//     });
//     const result = await response.json();
//     return result.error === 0
//       ? { error: 0, verification_id: result.verification_id, newVerStatus: result.newVerStatus, newAppStatus: result.newAppStatus }
//       : { error: 1, errorMsg: result.errorMsg };
//   } catch (err) {
//     return { error: 1, errorMsg: 'Server error' };
//   }
// }


async function submitDecision({ application_id, decision, remark, reason_codes = [], iteration = 1 }) {
  try {
    const token = getAdminToken();

    console.log('submitDecision called with:', { application_id, decision, remark, reason_codes });

    const response = await fetch('/api/admin/verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({
        action: 'finalDecision',
        application_id,
        decision,
        remark,
        reason_codes,
        iteration
      })
    });

    console.log('API response status:', response.status);

    const result = await response.json();

    console.log('API response body:', result);

    if (result.error === 0) {
      return {
        error: 0,
        verification_id: result.verification_id,
        newVerStatus: result.newVerStatus,
        newAppStatus: result.newAppStatus
      };
    } else {
      return { error: 1, errorMsg: result.errorMsg || 'Failed' };
    }

  } catch (err) {
    //console.error('submitDecision fetch error:', err);
    return { error: 1, errorMsg: err.message || 'Server error' };
  }
}

async function loadAnswers(application_id) {
  return getVerificationAnswers(application_id); 
}

async function getRejectReasons(){
  try{
    const token = getAdminToken();

      const response = await fetch('/api/admin/reject-reasons', {
      method : 'GET',
      headers:{
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if(!response.ok || result.error !== 0){
      return{
        error : 1,
        erroMsg : result.errorMsg || 'Failed to fetch reject reasons',
        resions :[]
      };
    }
    return {
      error : 0,
      reasons: result.reasons || []
    }
  }
  catch(err){
    return {error : 1, errorMsg : err.message ||'server error',reasons : []};
  }
}

 export {
    validateAdminToken,
    clearAdminSession,
    refreshAdminToken,
    adminLogin,
    getDistrictApplicationsPaginated,
    getCheckpoints,
    getVerificationAnswers,
    saveAnswers,
    submitDecision,
    loadAnswers,
    getRejectReasons,
 };