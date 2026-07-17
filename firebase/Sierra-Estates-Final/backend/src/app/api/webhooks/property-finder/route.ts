import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/server/firebase-admin';

function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(req: NextRequest) {
  const secret = process.env.PROPERTY_FINDER_WEBHOOK_SECRET;
  const signature = req.headers.get('x-pf-signature') || '';
  const rawBody = await req.text();

  if (secret && signature) {
    if (!verifyHmacSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  try {
    const body = JSON.parse(rawBody);
    await adminDb.collection('pfWebhookEvents').add({
      ...body,
      receivedAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[webhooks/property-finder] error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
