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

async function adminLogin(username, password) {
  const response = await fetch('/api/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if (data.error !== 0) {                        
    throw new Error(data.errorMsg || "Login failed"); 
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token
  };
}


export {
    adminLogin
};