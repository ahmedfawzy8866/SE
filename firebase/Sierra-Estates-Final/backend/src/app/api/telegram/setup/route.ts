import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/server/auth-guard';

export async function GET(req: NextRequest) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
  }

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/api/telegram/webhook`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
    );
    const data = await res.json();
    return NextResponse.json({ success: true, telegram: data, webhookUrl });
  } catch (err) {
    console.error('[telegram/setup] error:', err);
    return NextResponse.json({ error: 'Failed to set Telegram webhook' }, { status: 500 });
  }
}
