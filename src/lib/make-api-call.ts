import { getAccessToken } from "@/lib/cognito-token"
import { toast } from "@/hooks/use-toast"
import { signOut } from "@/lib/cognito"

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

interface ApiCallOptions<TBody = unknown> {
  baseUrl: string | undefined
  method: ApiMethod
  path: string
  body?: TBody
  params?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  requiresAuth?: boolean
}

interface ApiResponse<T> {
  data: T
  status: number
  ok: boolean
}

export class ApiError extends Error {
  status: number
  data: any

  constructor(message: string, status: number, data: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

// Base API URL - to be filled in later

// Create a function for handling session expiry
const handleSessionExpiry = () => {
  // Show toast notification
  toast({
    variant: "destructive",
    title: "Authentication Error",
    description: "Your session is invalid or expired. Please login again",
  })
  
  // Log user out
  signOut()
  
  // Redirect to login page
  window.location.href = "/auth/signin" // Using window.location for a hard redirect
}

export async function makeApiCall<TResponse, TBody = unknown>({
  baseUrl,
  method,
  path,
  body,
  params,
  headers = {},
  requiresAuth = true,
}: ApiCallOptions<TBody>): Promise<ApiResponse<TResponse>> {
  // Construct URL with query parameters
  const url = new URL(`${baseUrl}/${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value))
      }
    })
  }
  // Prepare headers
  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  }

  // Add authorization header if required
  if (requiresAuth) {
    const token = getAccessToken()
    if (!token) {
      throw new ApiError("Authentication required", 401, { message: "No access token available" })
    }
    requestHeaders.Authorization = `Bearer ${token}`
  }

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  }

  // Add body for non-GET requests
  if (method !== "GET" && body !== undefined) {
    requestOptions.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url.toString(), requestOptions)
    // Parse response data
    let data
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    // Handle authentication errors (401/403)
    if (response.status === 401 || response.status === 403) {
      handleSessionExpiry()
      throw new ApiError("Authentication error", response.status, data)
    }

    // Handle other error responses
    if (!response.ok) {
      throw new ApiError(`API error: ${response.status} ${response.statusText}`, response.status, data)
    }

    return {
      data: data as TResponse,
      status: response.status,
      ok: response.ok,
    }
  } catch (error) {
    // If it's already an ApiError and it's an auth error, don't throw again
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw error
    }

    // If it's another type of ApiError, throw it normally
    if (error instanceof ApiError) {
      throw error
    }

    // Handle network errors
    throw new ApiError(`Network error: ${(error as Error).message}`, 0, { message: (error as Error).message })
  }
}

