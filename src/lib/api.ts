import { useAuthStore } from "@/store/auth-store"

// Function to make authenticated API requests
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const accessToken = useAuthStore.getState().accessToken

  if (!accessToken) {
    throw new Error("No access token available")
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle 401 Unauthorized errors
  if (response.status === 401) {
    // Token might be expired, sign out the user
    useAuthStore.getState().signOut()
    throw new Error("Authentication expired. Please sign in again.")
  }

  return response
}

