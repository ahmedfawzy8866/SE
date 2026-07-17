export async function sendTelegramMessage(text: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId   = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set, skipping message');
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:    chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[telegram] Send failed:', err);
    }
  } catch (err) {
    console.error('[telegram] Network error:', err);
  }
}

export async function handleTelegramCommand(
  message: { text?: string; chat?: { id: number }; from?: { first_name?: string } }
): Promise<void> {
  const text   = message.text || '';
  const chatId = message.chat?.id;

  if (!chatId) return;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  const sendReply = async (reply: string) => {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply, parse_mode: 'Markdown' }),
    });
  };

  if (text.startsWith('/start')) {
    await sendReply(`🌄 *Sierra Estates Bot*\n\nWelcome, ${message.from?.first_name || 'Agent'}!\n\nCommands:\n/stats — Pipeline statistics\n/leads — Recent leads\n/listings — Active portfolio assets`);
  } else if (text.startsWith('/stats')) {
    await sendReply('📊 *Pipeline Stats*\n\nFetching real-time data...');
  } else if (text.startsWith('/leads')) {
    await sendReply('👥 *Recent Stakeholders*\n\nFetching latest leads...');
  } else if (text.startsWith('/listings')) {
    await sendReply('🏘️ *Portfolio Assets*\n\nFetching active listings...');
  } else if (text.startsWith('/diag')) {
    await sendReply('🔧 *Diagnostics*\n\nSystem operational.');
  } else {
    await sendReply('❓ Unknown command. Use /start to see available commands.');
  }
}
