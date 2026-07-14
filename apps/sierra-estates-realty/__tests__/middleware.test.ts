/**
 * Tests: Edge Proxy (proxy.ts)
 *
 * The admin / public host-split logic was REMOVED — the admin console is now
 * a separate Vite SPA at apps/admin-dashboard/, deployed as its own Vercel
 * project at admin.sierra-estates.net. This app (realty) no longer has an
 * /admin route.
 *
 * The proxy now handles only:
 *   1. CORS preflight for /api routes
 *   2. Shared-secret gate on /api/orchestrate
 */
import { NextRequest } from 'next/server';
import { config, proxy as middleware } from '../proxy';

const ORIGINAL_SBR = process.env.SBR_SECRET_KEY;

function request(url: string, init?: RequestInit): NextRequest {
  return new NextRequest(url, init);
}

afterEach(() => {
  if (ORIGINAL_SBR === undefined) {
    delete process.env.SBR_SECRET_KEY;
  } else {
    process.env.SBR_SECRET_KEY = ORIGINAL_SBR;
  }
});

describe('proxy config', () => {
  it('matches only /api routes (admin route removed)', () => {
    expect(config.matcher).toEqual(['/api/:path*']);
  });
});

describe('proxy — public routes (no /admin handling)', () => {
  it('passes through non-api routes untouched (no /admin redirect anymore)', () => {
    const res = middleware(request('https://sierra-estates.net/listings'));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('passes through /admin paths as a normal 404 (admin no longer in this app)', () => {
    // /admin is not in the matcher, so the proxy doesn't even run for it.
    // Next.js will return its default 404 — the admin lives at admin.sierra-estates.net now.
    const res = middleware(request('https://sierra-estates.net/admin'));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });
});

describe('proxy — CORS preflight', () => {
  it('answers OPTIONS /api with 204', () => {
    const res = middleware(
      request('https://sierra-estates.net/api/listings', { method: 'OPTIONS' }),
    );
    expect(res.status).toBe(204);
  });
});

describe('proxy — /api/orchestrate shared-secret gate', () => {
  beforeEach(() => {
    process.env.SBR_SECRET_KEY = 'test-secret';
  });

  it('blocks /api/orchestrate without X-SBR-SECRET-KEY', () => {
    const res = middleware(
      request('https://sierra-estates.net/api/orchestrate', { method: 'POST' }),
    );
    expect(res.status).toBe(401);
  });

  it('blocks /api/orchestrate with wrong X-SBR-SECRET-KEY', () => {
    const res = middleware(
      request('https://sierra-estates.net/api/orchestrate', {
        method: 'POST',
        headers: { 'X-SBR-SECRET-KEY': 'wrong' },
      }),
    );
    expect(res.status).toBe(401);
  });

  it('allows /api/orchestrate with correct X-SBR-SECRET-KEY', () => {
    const res = middleware(
      request('https://sierra-estates.net/api/orchestrate', {
        method: 'POST',
        headers: { 'X-SBR-SECRET-KEY': 'test-secret' },
      }),
    );
    expect(res.status).toBe(200);
  });

  it('allows /api/orchestrate when SBR_SECRET_KEY is unset (local dev)', () => {
    delete process.env.SBR_SECRET_KEY;
    const res = middleware(
      request('https://sierra-estates.net/api/orchestrate', { method: 'POST' }),
    );
    expect(res.status).toBe(200);
  });
});
