import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Paths that don't require authentication
const publicPaths = ["/", "/login", "/register", "/auth/signin", "/auth/signup", "/api/health"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is public
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for session cookie
  const hasSessionCookie = request.cookies.has("session") || request.cookies.has("connect.sid")

  if (!hasSessionCookie) {
    // Redirect to login page with the current URL as the callback URL
    const url = new URL("/auth/signin", request.url)
    url.searchParams.set("callbackUrl", "/insights") // Changed from request.nextUrl.pathname to always redirect to insights
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/sessions/:path*",
    "/record-insights/:path*",
    "/action-items/:path*",
    "/insights/:path*",
    "/settings/:path*",
    "/admin-settings/:path*",
  ],
}

