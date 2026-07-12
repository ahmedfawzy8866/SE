import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { OmnichannelChatService } from '@/lib/services/OmnichannelChatService';

/**
 * SIERRA ESTATES WEB CONCIERGE CHAT API
 * Serves as the dynamic gateway between the web-based LeilaConcierge widget and OmnichannelChatService.
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId, message, name } = await req.json();

    if (!sessionId || !message) {
      return NextResponse.json({ error: "Missing sessionId or message payload" }, { status: 400 });
    }

    const result = await OmnichannelChatService.handleIncomingMessage({
      platform: 'web',
      senderId: sessionId,
      senderName: name || 'Web Guest',
      text: message
    });

    return NextResponse.json({
      success: result.success,
      reply: result.replyText,
      stakeholderId: result.stakeholderId,
      action: result.actionTaken
    });
  } catch (error: any) {
    logger.error('Web concierge request failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Failed to process concierge request" }, { status: 500 });
  }
}
