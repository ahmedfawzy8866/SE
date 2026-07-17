import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { corsHeaders } from '@/lib/server/cors';

/**
 * Edge proxy (formerly middleware.ts — renamed for Next.js 16+).
 * Three concerns, kept apart:
 *
 * 0. Admin / public split — the staff admin console (and the bot/agent trigger
 *    routes it calls) is isolated from the public marketing site by host. When
 *    `ADMIN_HOST` is set (e.g. "admin.sierra-estates.net"), any `/admin` request
 *    arriving on a different host is redirected to the admin host, so the public
 *    domain never serves the console. INERT until `ADMIN_HOST` is configured —
 *    i.e. nothing changes until the admin subdomain + its own Vercel project
 *    exist — so local dev and the current single-deployment setup are unaffected.
 *
 * 1. CORS — the Sierra Estates frontend is a separate origin (its own repo /
 *    deployment), so every `/api` response carries an allowlisted CORS header
 *    set and preflight `OPTIONS` requests are answered here. The allowlist is
 *    driven by `ALLOWED_ORIGINS` (see `lib/server/cors.ts`). Dynamic origin
 *    reflection lives here because static `vercel.json` headers can only pin a
 *    single origin — which breaks preview deploys and local dev.
 *
 * 2. Shared-secret gate — ONLY `/api/orchestrate` is gated on `X-SBR-SECRET-KEY`.
 *    Public/browser routes (`/api/listings`, `/api/leads`, `/api/concierge`, …),
 *    cron routes (authenticated with `CRON_SECRET`) and inbound third-party
 *    webhooks (`/api/webhooks/*`, `/api/telegram`, `/api/whatsapp/*` — each with
 *    its own secret/HMAC) authenticate themselves and must NEVER be gated here,
 *    or we would 401 the public site and break inbound webhooks.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminHost = process.env.ADMIN_HOST;
  const requestHost = request.headers.get('host') ?? request.nextUrl.hostname;
  const onAdminHost = Boolean(adminHost) && requestHost === adminHost;

  // 0a) On the admin host, the console IS the site: rewrite the root to
  //     /admin so admin.sierra-estates.net/ serves the console directly.
  //     API routes, /_next assets and /admin/* itself pass through untouched.
  if (onAdminHost && pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.rewrite(url);
  }

  // 0b) Admin / public host split (inert unless ADMIN_HOST is set).
  if (pathname.startsWith('/admin')) {
    if (adminHost && !onAdminHost) {
      const url = new URL(request.url);
      url.hostname = adminHost;
      url.protocol = 'https:';
      url.port = '';
      // 307 (temporary) keeps it easy to undo and avoids aggressive caching.
      return NextResponse.redirect(url, 307);
    }
    // On the admin host (or single-deployment mode), serve the console as-is.
    return NextResponse.next();
  }

  const origin = request.headers.get('origin');
  const cors = corsHeaders(origin);

  // 1) Answer CORS preflight immediately for any /api route.
  if (request.method === 'OPTIONS' && pathname.startsWith('/api')) {
    return new NextResponse(null, { status: 204, headers: cors });
  }

  // 2) Shared-secret gate — internal automation route(s) only.
  if (pathname.startsWith('/api/orchestrate')) {
    const inboundSecretHeader = request.headers.get('X-SBR-SECRET-KEY');
    const systemSecureToken = process.env.SBR_SECRET_KEY;

    // Token configured but missing/mismatched → block. No token (local dev) → allow.
    if (systemSecureToken && inboundSecretHeader !== systemSecureToken) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized: Invalid or missing X-SBR-SECRET-KEY' }),
        { status: 401, headers: { 'content-type': 'application/json', ...cors } }
      );
    }
  }

  // 3) Forward the request, attaching CORS headers to the response.
  const res = NextResponse.next();
  for (const [key, value] of Object.entries(cors)) res.headers.set(key, value);
  return res;
}

// Matches the root (admin-host rewrite), every /api route (CORS) and every
// /admin route (host split). The secret gate inside the handler still
// restricts itself to /api/orchestrate — do NOT move that check into the
// matcher, or public/cron/webhook routes break.
export const config = { matcher: ['/', '/api/:path*', '/admin/:path*'] };
