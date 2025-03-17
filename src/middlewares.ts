import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define which routes should be protected
const protectedRoutes = ["/dashboard", "/profile", "/settings"]

// Define public routes (no authentication needed)
const publicRoutes = ["/auth/signin", "/auth/signup", "/auth/forgot-password", "/auth/verify", "/auth/reset-password"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // If it's not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Check for authentication token in cookies
  const authToken = request.cookies.get("CognitoIdToken")?.value

  // If no token is found, redirect to login
  if (!authToken) {
    const url = new URL("/auth/signin", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // Token exists, allow access to protected route
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

