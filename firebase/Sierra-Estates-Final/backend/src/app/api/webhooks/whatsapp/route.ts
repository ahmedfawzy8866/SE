import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { WhatsAppParserService } from '@/lib/services/WhatsAppParserService';

const parser = new WhatsAppParserService();

export async function GET(req: NextRequest) {
  // WhatsApp webhook verification
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extract messages from WhatsApp Cloud API format
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages || [];

    for (const msg of messages) {
      const text = msg.text?.body || '';
      if (!text) continue;

      // Parse with AI
      const parsed = await parser.parseMessage(text);

      await adminDb.collection('rawScrapeData').add({
        message: text,
        source: 'whatsapp_cloud',
        senderPhone: msg.from,
        parsedData: parsed,
        status: parsed ? 'extracted' : 'pending_review',
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[webhooks/whatsapp] error:', err);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
