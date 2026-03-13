import { json } from '@sveltejs/kit';

export async function POST({ request }) {

  const { username, password } = await request.json();

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

    if (!response.ok) {
      return json({
        error: -1,
        errorMsg: data.error_description || "Invalid username or password"
      }, { status: 401 });
    }

    return json({
      error: 0,
      access_token: data.access_token,
      refresh_token: data.refresh_token
    });

  } catch (error) {

    console.error("Keycloak Login Error:", error);

    return json({
      error: -1,
      errorMsg: "Authentication server error"
    }, { status: 500 });

  }

}