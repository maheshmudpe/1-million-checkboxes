import { getServerUrl } from "../../common/config.js";

const TOKEN_KEY = "checkbox_access_token";
const USER_KEY = "checkbox_user";
const CLIENT_ID = "checkbox-web-client";

export async function login(username) {
  const authorizeRes = await fetch(`${getServerUrl()}/oauth/authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  if (!authorizeRes.ok) {
    throw new Error("Unable to start login");
  }

  const { code } = await authorizeRes.json();

  const tokenRes = await fetch(`${getServerUrl()}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error("Unable to exchange authorization code");
  }

  const tokenSet = await tokenRes.json();

  localStorage.setItem(TOKEN_KEY, tokenSet.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(tokenSet.user));

  return tokenSet;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}
