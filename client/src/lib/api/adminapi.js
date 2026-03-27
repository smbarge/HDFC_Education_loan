// src/lib/api/adminapi.js

// async function adminLogin(username, password) {
//   const params = new URLSearchParams();
//   params.append("client_id", "education-admin");
//   params.append("client_secret", "KAJ7j5zoBs75YybVVusB5CmkHCml2nPL");
//   params.append("grant_type", "password");
//   params.append("username", username);
//   params.append("password", password);

//   const response = await fetch(
//     "https://keycloak.chanakyasoft.com/realms/education-loan/protocol/openid-connect/token",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded"
//       },
//       body: params
//     }
//   );

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(data.error_description || "Invalid username or password");
//   }

//   return {
//     access_token: data.access_token,
//     refresh_token: data.refresh_token
//   };
// }

// async function adminLogin(username, password) {
//   const response = await fetch('/api/admin/auth', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ username, password })
//   });

//   const data = await response.json();

//   if (data.error !== 0) {                        
//     throw new Error(data.errorMsg || "Login failed"); 
//   }

// //   return {
// //     access_token: data.access_token,
// //     refresh_token: data.refresh_token
// //   };

//     return {
//     error: 0,
//     access_token: data.access_token,
//     refresh_token: data.refresh_token,
//     district: data.district,
//     username: data.username
//     };
// }

async function adminLogin(username, password) {
  try {
    const response = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.error !== 0) {                        
      throw new Error(data.errorMsg || "Login failed"); 
    }

    return {
      error: 0,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      district: data.district,
      username: data.username
    };

  } catch (error) {

    console.error("Admin login error:", error);

    throw new Error(error.message || "Something went wrong during login");

  }
}

//Feach the distrct wise 
async function getDistrictApplications(district) {
  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`/api/admin/applications?district=${district}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok || result.error !== 0) {
      return { error: 1, errorMsg: result.errorMsg || 'Failed to fetch applications' };
    }

    return {
      error: 0,
      total: result.total,
      approved: result.approved,
      pending: result.pending,
      rejected: result.rejected,
      applications: result.applications,
      district: result.district
    };

  } catch (err) {
    console.error('getDistrictApplications error:', err);
    return { error: 1, errorMsg: 'Server error' };
  }
}

function getCookieValue(name) {
  if (typeof document === 'undefined') return '';
  return document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1] || '';
}

//distrct with oagination 
async function getDistrictApplicationsPaginated(district, page = 1, limit = 10) {
  try {
    const token = getCookieValue('adminToken') || localStorage.getItem('adminToken') || '';

    const response = await fetch(
      `/api/admin/applications?district=${encodeURIComponent(district)}&page=${page}&limit=${limit}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const result = await response.json();

    if (!response.ok || result.error !== 0) {
      return { error: 1, errorMsg: result.errorMsg || 'Failed to fetch applications' };
    }

    return {
      error:        0,
      total:        result.total,
      approved:     result.approved,
      pending:      result.pending,
      rejected:     result.rejected,
      page:         result.page,
      perPage:      result.perPage,
      totalPages:   result.totalPages,
      applications: result.applications,
      district:     result.district
    };

  } catch (err) {
    console.error('getDistrictApplicationsPaginated error:', err);
    return { error: 1, errorMsg: 'Server error' };
  }
}


async function getCheckpoints(adminToken) {
  try {
    const response = await fetch('/api/admin/checkpoints', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const result = await response.json();

    if (!response.ok || result.error !== 0) {
      return { error: 1, errorMsg: result.errorMsg || 'Failed to fetch checkpoints', byDocument: {} };
    }

    return {
      error: 0,
      byDocument: result.byDocument || {}
    };

  } catch (err) {
    console.error('getCheckpoints error:', err);
    return { error: 1, errorMsg: 'Server error', byDocument: {} };
  }
}

async function getVerificationAnswers(adminToken, application_id) {
  try {
    const response = await fetch(`/api/admin/verification?application_id=${application_id}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
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

async function saveAnswers(adminToken, { application_id, answers, iteration = 1 }) {
  try {
    const response = await fetch('/api/admin/verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
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

async function submitDecision(adminToken, { application_id, decision, remark, iteration = 1 }) {
  try {
    const response = await fetch('/api/admin/verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      credentials: 'include',
      body: JSON.stringify({ action: 'finalDecision', application_id, decision, remark, iteration })
    });
    const result = await response.json();
    return result.error === 0
      ? { error: 0, verification_id: result.verification_id, newVerStatus: result.newVerStatus, newAppStatus: result.newAppStatus }
      : { error: 1, errorMsg: result.errorMsg };
  } catch (err) {
    return { error: 1, errorMsg: 'Server error' };
  }
}

async function loadAnswers(adminToken, application_id) {
  try {
    const response = await fetch(`/api/admin/verification?application_id=${application_id}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
      credentials: 'include'
    });
    const result = await response.json();
    return result.error === 0
      ? { error: 0, answers: result.answers, verification_id: result.verification_id }
      : { error: 1, answers: {} };
  } catch (err) {
    return { error: 1, answers: {} };
  }
}

export {
    adminLogin,
    getDistrictApplications,
    getDistrictApplicationsPaginated,
    getCheckpoints,
    getVerificationAnswers,
    saveAnswers,
    submitDecision,
    loadAnswers,
    
};