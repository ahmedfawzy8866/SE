/**
 * Middleware — host-split + auth gate.
 *
 * Two-domain architecture (set ADMIN_HOST env var to enable):
 *   sierra-estates.net      → client page only; /admin/* redirects to admin host
 *   admin.sierra-estates.net → admin page only; / rewrites to /admin
 *
 * Single-domain mode (ADMIN_HOST unset, e.g., local dev):
 *   everything served on one host; /admin renders normally.
 *
 * Auth: /api/admin/* requires a valid session cookie (HS256-verified).
 * Role checks for specific actions happen in the route handler via
 * requireRole().
 */
import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

const ADMIN_HOST = process.env.ADMIN_HOST ?? "";      // e.g. "admin.sierra-estates.net"
const CLIENT_HOST = process.env.CLIENT_HOST ?? "";     // e.g. "sierra-estates.net"

export const config = {
  // Run on: root (for admin-host rewrite), /admin/* (for client-host redirect),
  // /api/admin/* (for session verification + client-host block).
  matcher: ["/", "/admin/:path*", "/api/admin/:path*"],
};

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get("host") ?? "";
  const isAdminHost = Boolean(ADMIN_HOST) && host === ADMIN_HOST;
  const splitEnabled = Boolean(ADMIN_HOST);

  /* ─── Admin host: rewrite / → /admin (admin page at the root) ─── */
  if (isAdminHost && url.pathname === "/") {
    const target = new URL("/admin", req.url);
    return NextResponse.rewrite(target);
  }

  /* ─── Client host: redirect /admin/* → admin subdomain ─── */
  if (!isAdminHost && splitEnabled && url.pathname.startsWith("/admin")) {
    const target = new URL(`https://${ADMIN_HOST}`);
    return NextResponse.redirect(target, 307);
  }

  /* ─── Client host: block /api/admin/* (defense in depth) ─── */
  if (!isAdminHost && splitEnabled && url.pathname.startsWith("/api/admin")) {
    return NextResponse.json(
      { error: "Forbidden — admin API only available on the admin host." },
      { status: 403, headers: { "content-type": "application/json" } }
    );
  }

  /* ─── Session verification for /api/admin/* (admin host or single-domain) ─── */
  if (url.pathname.startsWith("/api/admin")) {
    const token = req.cookies.get(SESSION_COOKIE)?.value ?? null;
    const sess = await verifySession(token);
    if (!sess) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }
    // Inject session as a header for the route handler to read.
    const res = NextResponse.next();
    res.headers.set("x-sierra-sess", JSON.stringify(sess));
    return res;
  }

  return NextResponse.next();
}

export const runtime = "nodejs";
