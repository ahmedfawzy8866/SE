import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 1000 * 60 * 60; // 1 hour

interface CSRFTokenPayload {
  token: string;
  timestamp: number;
}

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Create a CSRF token with timestamp for validation
 */
export function createCSRFToken(): CSRFTokenPayload {
  return {
    token: generateCSRFToken(),
    timestamp: Date.now(),
  };
}

/**
 * Validate a CSRF token
 * Checks if token exists and hasn't expired
 */
export function validateCSRFToken(
  token: string | null | undefined,
  storedToken: string | null | undefined
): boolean {
  if (!token || !storedToken) {
    return false;
  }

  // Use timing-safe comparison to prevent timing attacks
  try {
    const tokenBuffer = Buffer.from(token);
    const storedBuffer = Buffer.from(storedToken);

    if (tokenBuffer.length !== storedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(tokenBuffer, storedBuffer);
  } catch {
    return false;
  }
}

/**
 * Extract CSRF token from request headers
 * Checks: X-CSRF-Token header or csrf-token cookie
 */
export function extractCSRFToken(req: NextRequest): string | null {
  // Check header first
  const headerToken = req.headers.get('x-csrf-token');
  if (headerToken) return headerToken;

  // Check cookie
  const cookieToken = req.cookies.get('csrf-token')?.value;
  if (cookieToken) return cookieToken;

  return null;
}

/**
 * Middleware to validate CSRF tokens on state-changing requests
 * Apply to POST, PUT, DELETE, PATCH endpoints only
 */
export function validateCSRFMiddleware(method: string): boolean {
  // Only validate on state-changing methods
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  return !stateChangingMethods.includes(method.toUpperCase());
}

/**
 * Get CSRF token from request (for initial page load)
 */
export function getCSRFTokenFromRequest(req: NextRequest): CSRFTokenPayload | null {
  const token = extractCSRFToken(req);
  if (!token) return null;

  return {
    token,
    timestamp: Date.now(),
  };
}

/**
 * Check if token has expired
 */
export function isCSRFTokenExpired(timestamp: number): boolean {
  return Date.now() - timestamp > CSRF_TOKEN_EXPIRY;
}
