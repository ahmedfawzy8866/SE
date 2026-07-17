import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { WhatsAppParserService } from '@/lib/services/WhatsAppParserService';
import { sendTelegramMessage } from '@/lib/services/telegram-controller';

const parser = new WhatsAppParserService();

export async function POST(req: NextRequest) {
  const secretKey = req.headers.get('x-se-secret-key');
  if (secretKey !== process.env.X_SE_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { message, groupName, senderPhone, timestamp } = body;

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    // Parse with AI
    const parsed = await parser.parseMessage(message);
    const isDuplicate = await parser.checkDuplicate(message);

    const docRef = await adminDb.collection('rawScrapeData').add({
      message,
      groupName,
      senderPhone,
      timestamp: timestamp || new Date().toISOString(),
      parsedData: parsed,
      isDuplicate,
      status: isDuplicate ? 'duplicate_detected' : (parsed ? 'extracted' : 'pending_review'),
      createdAt: new Date().toISOString(),
    });

    if (parsed && !isDuplicate) {
      await sendTelegramMessage(
        `📨 *New WhatsApp Listing Ingested*\n\n🏢 ${parsed.compound || 'Unknown compound'}\n🛏 ${parsed.bedrooms || '?'}BR | ${parsed.area || '?'} sqm\n💰 ${parsed.price || 'Price TBD'}\n📊 Source: ${groupName || 'Unknown group'}`
      );
    }

    return NextResponse.json({
      success: true,
      id: docRef.id,
      parsed,
      isDuplicate,
    });
  } catch (err) {
    console.error('[whatsapp/webhook] error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
