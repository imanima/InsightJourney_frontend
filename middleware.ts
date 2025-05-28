import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define token key for consistency with auth-utils.ts
const TOKEN_KEY = 'auth_token';

// Define API paths that don't require authentication even though they're not public pages
const apiPublicPaths = ["/api/proxy/auth/login", "/api/proxy/auth/register", "/api/health"];

// Paths that don't require authentication (public pages)
const publicPaths = ["/", "/login", "/register", "/auth/signin", "/auth/signup", "/about", "/privacy", "/terms"];

/**
 * Check if a JWT token is expired by decoding it
 * Note: This doesn't verify the signature, just checks expiration
 * @param token The JWT token to check
 * @returns Boolean indicating if token is expired
 */
function isTokenExpired(token: string): boolean {
  try {
    // Parse the token parts
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const { exp } = JSON.parse(jsonPayload);
    
    // Check if token has expiration and if it's in the past
    if (!exp) return true;
    return exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error checking token expiration in middleware:', error);
    return true; // If we can't validate, assume it's expired for security
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is a public page or a public API route
  if (
    publicPaths.some((path) => pathname === path || pathname.startsWith(path + '/')) ||
    apiPublicPaths.some((path) => pathname === path || pathname.startsWith(path + '/'))
  ) {
    return NextResponse.next()
  }

  // Get auth token from cookies
  const tokenCookie = request.cookies.get(TOKEN_KEY);
  
  // Check if token exists and is valid
  if (!tokenCookie || !tokenCookie.value) {
    // No token found, redirect to login
    return redirectToLogin(request);
  }
  
  // Check if token is expired
  if (isTokenExpired(tokenCookie.value)) {
    // Token is expired, redirect to login
    const response = NextResponse.redirect(getLoginUrl(request));
    
    // Clear the expired token cookie
    response.cookies.delete(TOKEN_KEY);
    
    return response;
  }

  // Token exists and is valid, proceed
  return NextResponse.next()
}

/**
 * Create a login URL with callback
 * @param request The original request
 * @returns URL to redirect to
 */
function getLoginUrl(request: NextRequest): URL {
  const url = new URL("/login", request.url);
  
  // Save the current path as a callback URL, excluding API paths
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/api/')) {
    url.searchParams.set("callbackUrl", pathname || "/insights");
  } else {
    url.searchParams.set("callbackUrl", "/insights"); // Default for API routes
  }
  
  return url;
}

/**
 * Redirect to login page
 * @param request The original request
 * @returns Redirect response
 */
function redirectToLogin(request: NextRequest): NextResponse {
  // For API requests, return 401 instead of redirecting
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  // For regular pages, redirect to login
  return NextResponse.redirect(getLoginUrl(request));
}

export const config = {
  matcher: [
    // Protected pages
    "/sessions/:path*",
    "/record-insights/:path*",
    "/action-items/:path*",
    "/insights/:path*",
    "/settings/:path*",
    "/admin-settings/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
    
    // Protected API routes except for auth
    "/api/((?!proxy/auth/login|proxy/auth/register|health).*)"  
  ],
}

