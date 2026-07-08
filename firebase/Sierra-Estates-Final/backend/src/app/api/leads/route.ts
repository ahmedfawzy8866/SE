import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { sendTelegramMessage } from '@/lib/services/telegram-controller';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, budget, preferredCompounds, notes, source } = body;

  if (!name || !phone) {
    return NextResponse.json(
      { error: 'Missing required fields: name, phone' },
      { status: 400 }
    );
  }

  try {
    const docRef = await adminDb.collection('leads').add({
      name,
      phone,
      email: email || null,
      budget: budget || null,
      preferredCompounds: preferredCompounds || [],
      notes: notes || '',
      source: source || 'web',
      status: 'new',
      stage: 'S1_intake',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Telegram notification
    await sendTelegramMessage(
      `🔥 *New Investment Stakeholder*\n\n👤 ${name}\n📱 ${phone}\n💰 Budget: ${budget || 'Not specified'}\n🏘️ Compounds: ${(preferredCompounds || []).join(', ') || 'Not specified'}\n🌐 Source: ${source || 'web'}`
    );

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('[leads] error:', err);
    return NextResponse.json({ error: 'Failed to create stakeholder' }, { status: 500 });
  }
}
