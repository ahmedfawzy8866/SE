import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [ip: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

/**
 * Rate limiting middleware: 100 requests per minute per IP
 */
export function rateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
) {
  return (req: NextRequest) => {
    const ip = req.headers.get('x-forwarded-for') ||
               req.headers.get('x-real-ip') ||
               'unknown';

    const now = Date.now();
    const record = rateLimitStore[ip];

    // Clean up old records
    if (record && now > record.resetTime) {
      delete rateLimitStore[ip];
    }

    // Initialize or increment counter
    if (!rateLimitStore[ip]) {
      rateLimitStore[ip] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return null; // Request allowed
    }

    rateLimitStore[ip].count += 1;

    // Check limit
    if (rateLimitStore[ip].count > maxRequests) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)),
          }
        }
      );
    }

    return null; // Request allowed
  };
}

/**
 * Wrap API route with rate limiting
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  maxRequests: number = 100
) {
  const limiter = rateLimit(maxRequests);

  return async (req: NextRequest) => {
    const rateLimitResponse = limiter(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    return handler(req);
  };
}
