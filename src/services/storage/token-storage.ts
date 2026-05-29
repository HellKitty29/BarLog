const ACCESS_TOKEN_KEY = "barlog.accessToken";
const REFRESH_TOKEN_KEY = "barlog.refreshToken";

function readStorage(key: string) {
  if (typeof localStorage === "undefined") {
    return null;
  }

  return localStorage.getItem(key);
}

function writeStorage(key: string, value: string) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(key, value);
}

function removeStorage(key: string) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.removeItem(key);
}

export async function getAccessToken() {
  return readStorage(ACCESS_TOKEN_KEY);
}

export async function setAccessToken(token: string) {
  writeStorage(ACCESS_TOKEN_KEY, token);
}

export async function getRefreshToken() {
  return readStorage(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token: string) {
  writeStorage(REFRESH_TOKEN_KEY, token);
}

export async function clearTokens() {
  removeStorage(ACCESS_TOKEN_KEY);
  removeStorage(REFRESH_TOKEN_KEY);
}
