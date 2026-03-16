import { json } from '@sveltejs/kit';

export async function POST({ request }) {

  const { username, password } = await request.json();
  console.log("Login request received----");
  console.log("Username:", username);

  try {

    const params = new URLSearchParams();
    params.append("client_id", "education-admin");
    params.append("client_secret", "KAJ7j5zoBs75YybVVusB5CmkHCml2nPL"); 
    params.append("grant_type", "password");
    params.append("username", username);
    params.append("password", password);

    const response = await fetch(
      "https://keycloak.chanakyasoft.com/realms/education-loan/protocol/openid-connect/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
      }
    );

    const data = await response.json();
   // console.log("Key cloak responce _:",data);
    

    if (!response.ok) {
      return json({
        error: -1,
        errorMsg: data.error_description || "Invalid username or password"
      }, { status: 401 });
    }

    const payload = JSON.parse(
        Buffer.from(data.access_token.split('.')[1], 'base64').toString()
        );

   // console.log("Decoded tokan payload :", payload);
    

        const district = payload.district        
        || payload.given_name                 
        || username.replace('_admin', '');    

    console.log("Distrct decoded :",district);
    console.log("preferd username :",payload.preferred_username);


        return json({
        error: 0,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        district: district,
        username: payload.preferred_username
        });

      

  } catch (error) {

    console.error("Keycloak Login Error:", error);

    return json({
      error: -1,
      errorMsg: "Authentication server error"
    }, { status: 500 });

  }

}