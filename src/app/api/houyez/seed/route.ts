/**
 * POST /api/houyez/seed
 * ────────────────────────────────────────────────────────────────────────────
 * Admin-only endpoint that seeds the five Houyez Firestore collections
 * (houyez_slides, houyez_compounds, houyez_rooms, houyez_listings,
 * houyez_tours) from the static seed data in src/data/houyez-properties.ts.
 *
 * Body:
 *   { "overwrite": false }   ← skip collections that already have docs (default)
 *   { "overwrite": true }    ← wipe each collection first, then re-insert
 *
 * Auth: requires the `x-admin-key` header to match process.env.ADMIN_API_KEY.
 * In dev (no ADMIN_API_KEY set), the endpoint is open for convenience.
 *
 * Response:
 *   200 { success: true, result: { slides, compounds, rooms, listings, tours, skipped, errors } }
 *   401 { success: false, error: 'Unauthorized' }
 *   500 { success: false, error: '<message>' }
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────────────────────
  const adminKey = process.env.ADMIN_API_KEY;
  if (adminKey) {
    const provided = req.headers.get('x-admin-key');
    if (provided !== adminKey) {
       
      console.warn('[houyez/seed] unauthorized attempt');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  // ─── Parse body ──────────────────────────────────────────────────────────
  let overwrite = false;
  try {
    const body = await req.json();
    if (body && typeof body.overwrite === 'boolean') overwrite = body.overwrite;
  } catch {
    // Empty / invalid body is fine — default overwrite=false
  }

  // ─── Run seed ────────────────────────────────────────────────────────────
  try {
    const { seedHouyezPortal } = await import('@/lib/houyez/firestore');
    const result = await seedHouyezPortal({ overwrite });
     
    console.info('[houyez/seed] seed completed', result);
    return NextResponse.json({ success: true, result });
  } catch (err) {
    const msg = (err as Error).message;
     
    console.error('[houyez/seed] seed failed:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Use POST with optional { overwrite: boolean } body' },
    { status: 405 },
  );
}
