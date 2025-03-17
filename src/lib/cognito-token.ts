import Cookies from "js-cookie"

// Token storage keys
const ID_TOKEN_KEY = "CognitoIdToken"
const ACCESS_TOKEN_KEY = "CognitoAccessToken"
const REFRESH_TOKEN_KEY = "CognitoRefreshToken"

// Token expiration (in days)
const TOKEN_EXPIRATION = 7

// Store tokens in cookies
export const storeTokens = (idToken: string, accessToken: string, refreshToken: string) => {
  Cookies.set(ID_TOKEN_KEY, idToken, { expires: TOKEN_EXPIRATION, secure: true, sameSite: "strict" })
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: TOKEN_EXPIRATION, secure: true, sameSite: "strict" })
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: TOKEN_EXPIRATION, secure: true, sameSite: "strict" })
}

// Get access token
export const getAccessToken = (): string | undefined => {
  return Cookies.get(ACCESS_TOKEN_KEY)
}

// Get ID token
export const getIdToken = (): string | undefined => {
  return Cookies.get(ID_TOKEN_KEY)
}

// Clear all tokens (for logout)
export const clearTokens = () => {
  Cookies.remove(ID_TOKEN_KEY)
  Cookies.remove(ACCESS_TOKEN_KEY)
  Cookies.remove(REFRESH_TOKEN_KEY)

  // Also clear any other auth-related cookies or local storage items
  localStorage.removeItem("user")
  sessionStorage.removeItem("authState")

  console.log("All authentication tokens cleared")
}

// Create an authenticated fetch function that includes the token
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const accessToken = getAccessToken()

  if (!accessToken) {
    throw new Error("No access token available")
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

