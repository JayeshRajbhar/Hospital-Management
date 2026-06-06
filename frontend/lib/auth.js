const AUTH_CACHE_NAME = "auth-token-cache";
const TOKEN_KEY = "https://hospital.api/auth/token";
const USERNAME_KEY = "https://hospital.api/auth/username";

export async function getAuthToken() {
  if (typeof window === "undefined") return null;
  try {
    const cache = await caches.open(AUTH_CACHE_NAME);
    const response = await cache.match(TOKEN_KEY);
    if (response) {
      return await response.text();
    }
  } catch (error) {
    console.error("Cache Storage read error, falling back to localStorage", error);
  }
  return localStorage.getItem("auth_token");
}

export async function setAuthToken(token, username) {
  if (typeof window === "undefined") return;
  try {
    const cache = await caches.open(AUTH_CACHE_NAME);
    await cache.put(TOKEN_KEY, new Response(token));
    await cache.put(USERNAME_KEY, new Response(username));
  } catch (error) {
    console.error("Cache Storage write error, falling back to localStorage", error);
  }
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_username", username);
}

export async function getAuthUsername() {
  if (typeof window === "undefined") return null;
  try {
    const cache = await caches.open(AUTH_CACHE_NAME);
    const response = await cache.match(USERNAME_KEY);
    if (response) {
      return await response.text();
    }
  } catch (error) {
    console.error("Cache Storage read error, falling back to localStorage", error);
  }
  return localStorage.getItem("auth_username");
}

export async function clearAuthToken() {
  if (typeof window === "undefined") return;
  try {
    const cache = await caches.open(AUTH_CACHE_NAME);
    await cache.delete(TOKEN_KEY);
    await cache.delete(USERNAME_KEY);
  } catch (error) {
    console.error("Cache Storage delete error", error);
  }
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_username");
}
