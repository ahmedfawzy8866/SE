import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { sendTelegramMessage } from '@/lib/services/telegram-controller';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { stakeholderName, stakeholderPhone, assetId, preferredDate, notes } = body;

  if (!stakeholderName || !stakeholderPhone || !assetId) {
    return NextResponse.json(
      { error: 'Missing required fields: stakeholderName, stakeholderPhone, assetId' },
      { status: 400 }
    );
  }

  try {
    const docRef = await adminDb.collection('viewingRequests').add({
      stakeholderName,
      stakeholderPhone,
      assetId,
      preferredDate: preferredDate || null,
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    // Send Telegram alert
    await sendTelegramMessage(
      `🏠 *New Viewing Request*\n\n👤 ${stakeholderName}\n📱 ${stakeholderPhone}\n🏢 Asset: ${assetId}\n📅 Preferred: ${preferredDate || 'Flexible'}\n📝 ${notes || 'No notes'}`
    );

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('[leads/request-viewing] error:', err);
    return NextResponse.json({ error: 'Failed to create viewing request' }, { status: 500 });
  }
}
