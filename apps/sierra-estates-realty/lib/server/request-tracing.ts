import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'crypto';

/**
 * Request context with unique trace ID
 */
export interface RequestContext {
  requestId: string;
  timestamp: string;
  route: string;
  method: string;
  clientIp: string;
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract client IP from request
 */
export function extractClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'unknown';
}

/**
 * Create request context
 */
export function createRequestContext(req: NextRequest, route: string): RequestContext {
  return {
    requestId: generateRequestId(),
    timestamp: new Date().toISOString(),
    route,
    method: req.method,
    clientIp: extractClientIp(req),
  };
}

/**
 * Middleware to add request tracing headers
 */
export function addTracingHeaders(response: NextResponse, requestId: string): NextResponse {
  response.headers.set('X-Request-ID', requestId);
  response.headers.set('X-Trace-ID', requestId);
  return response;
}

/**
 * Get request ID from request headers
 */
export function getRequestId(req: NextRequest): string {
  return req.headers.get('x-request-id') || generateRequestId();
}
