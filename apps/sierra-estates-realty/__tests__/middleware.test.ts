/**
 * Tests: Admin Host Routing Proxy (proxy.ts)
 *
 * The middleware splits one codebase across two domains: when ADMIN_HOST is
 * set, /admin/* requests on the public domain are 307-redirected to the admin
 * host. Without ADMIN_HOST the middleware is inert (single-deploy topology).
 */
import { NextRequest } from 'next/server';
import { config, proxy as middleware } from '../proxy';

const ADMIN_HOST = 'admin.sierra-estates.net';
const ORIGINAL_ADMIN_HOST = process.env.ADMIN_HOST;

function request(url: string): NextRequest {
  return new NextRequest(url);
}

afterEach(() => {
  if (ORIGINAL_ADMIN_HOST === undefined) {
    delete process.env.ADMIN_HOST;
  } else {
    process.env.ADMIN_HOST = ORIGINAL_ADMIN_HOST;
  }
});

describe('middleware — ADMIN_HOST unset (single-deploy topology)', () => {
  beforeEach(() => {
    delete process.env.ADMIN_HOST;
  });

  describe('middleware config', () => {
    it('matches admin routes and API routes', () => {
      expect(config.matcher).toEqual(['/api/:path*', '/admin/:path*']);
    });
  });

  it('passes /admin requests through untouched', () => {
    const res = middleware(request('https://sierra-estates.net/admin/leads'));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('passes public routes through untouched', () => {
    const res = middleware(request('https://sierra-estates.net/listings'));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });
});

describe('middleware — ADMIN_HOST set (host-split topology)', () => {
  beforeEach(() => {
    process.env.ADMIN_HOST = ADMIN_HOST;
  });

  it('307-redirects public-domain /admin requests to the admin host', () => {
    const res = middleware(request('https://sierra-estates.net/admin'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(`https://${ADMIN_HOST}/admin`);
  });

  it('preserves the path and query string on redirect', () => {
    const res = middleware(
      request('https://sierra-estates.net/admin/intelligence-os?tab=agents'),
    );
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      `https://${ADMIN_HOST}/admin/intelligence-os?tab=agents`,
    );
  });

  it('serves /admin normally on the admin host itself', () => {
    const res = middleware(request(`https://${ADMIN_HOST}/admin/leads`));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('leaves non-admin public routes alone', () => {
    const res = middleware(request('https://sierra-estates.net/about'));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });
});
