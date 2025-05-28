/**
 * Utilities for handling authentication tokens across localStorage and cookies
 * This ensures tokens are available both for client-side API requests and
 * server-side middleware route protection
 */

// User type matching API response
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
  disabled: boolean;
}

// Token response from API
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Authentication state
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// Constants
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days

/**
 * Set auth token in both localStorage and cookie
 * @param token JWT token from API
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;

  try {
    // Set in localStorage for API client
    localStorage.setItem(TOKEN_KEY, token);
    
    // Set in cookie for middleware with secure flags
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${TOKEN_EXPIRY}; SameSite=Strict${location.protocol === 'https:' ? '; Secure' : ''}`;
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
}

/**
 * Save user data to localStorage
 * @param user User object from API
 */
export function setAuthUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error setting auth user:', error);
  }
}

/**
 * Get user data from localStorage
 * @returns User object or null
 */
export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

/**
 * Clear auth token from both localStorage and cookie
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;

  try {
    // Clear from localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Clear from cookie with secure flags
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Strict${location.protocol === 'https:' ? '; Secure' : ''}`;
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
}

/**
 * Get auth token from localStorage
 * @returns Auth token or null
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Check if user is authenticated by validating token exists
 * @returns Boolean indicating if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Parse JWT token to get payload without validation
 * Note: This does not verify the token, just extracts the payload
 * @param token JWT token
 * @returns Decoded payload or null
 */
export function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * @param token JWT token
 * @returns Boolean indicating if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return true;
    
    // Check if token expiration (in seconds) is before current time
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}
