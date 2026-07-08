import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const compound = searchParams.get('compound');
  const status = searchParams.get('status') || 'active';
  const limitParam = parseInt(searchParams.get('limit') || '50');

  try {
    let query = adminDb.collection('listings').where('status', '==', status);
    if (compound) {
      query = query.where('compound', '==', compound);
    }
    query = query.limit(Math.min(limitParam, 100)) as typeof query;

    const snapshot = await query.get();
    const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, listings, total: listings.length });
  } catch (err) {
    console.error('[listings] error:', err);
    return NextResponse.json({ error: 'Failed to fetch portfolio assets' }, { status: 500 });
  }
}
