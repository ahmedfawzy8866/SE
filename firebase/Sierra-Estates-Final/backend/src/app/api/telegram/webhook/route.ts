import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramCommand } from '@/lib/services/telegram-controller';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message || body.edited_message;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    await handleTelegramCommand(message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[telegram/webhook] error:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
