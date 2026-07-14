/**
 * Closer Agent — Stages 9 & 10
 * S9: Asset Finalization (deal terms, signing)
 * S10: Feedback Loop (post-close analysis)
 */

import { adminDb } from '@/lib/server/firebase-admin';
import { GoogleAIService } from '@/lib/server/google-ai';
import { sendTelegramMessage } from '@/lib/services/telegram-controller';

const ai = new GoogleAIService();

export class CloserAgent {
  async run(action: string, payload: Record<string, unknown>): Promise<unknown> {
    switch (action) {
      case 'finalize':
        return this.finalizeDeal(payload);
      case 'feedback':
        return this.collectFeedback(payload);
      default:
        throw new Error(`Unknown Closer action: ${action}`);
    }
  }

  async finalizeDeal(payload: Record<string, unknown>) {
    const { dealId, negotiatedPrice, commissionRate } = payload as {
      dealId: string;
      negotiatedPrice: number;
      commissionRate: number;
    };

    const doc = await adminDb.collection('deals').doc(dealId).get();
    if (!doc.exists) throw new Error(`Deal not found: ${dealId}`);

    const data = doc.data()!;
    const commission = (negotiatedPrice * commissionRate) / 100;

    await adminDb.collection('deals').doc(dealId).update({
      negotiatedPrice,
      commissionRate,
      commissionEGP: commission,
      stage: 'S9_finalized',
      status: 'pending_signing',
      updatedAt: new Date().toISOString(),
    });

    await sendTelegramMessage(
      `🤝 *Deal Finalized*\n\n🏢 Asset: ${data.assetId}\n💰 Price: ${negotiatedPrice.toLocaleString()} EGP\n📊 Commission: ${commission.toLocaleString()} EGP\n📄 Stage: S9 Finalized`
    );

    return { dealId, negotiatedPrice, commission, stage: 'S9_finalized' };
  }

  async collectFeedback(payload: Record<string, unknown>) {
    const { dealId } = payload as { dealId: string };

    const doc = await adminDb.collection('deals').doc(dealId).get();
    if (!doc.exists) throw new Error(`Deal not found: ${dealId}`);

    const analysis = await ai.generateContent(
      `Analyze this completed deal and extract learnings for future improvements:\n${JSON.stringify(doc.data())}\n\nReturn JSON: strengths[], improvements[], marketInsights[], agentPerformance`
    );

    let feedbackData: Record<string, unknown> = {};
    try { feedbackData = JSON.parse(analysis); } catch { feedbackData = {}; }

    await adminDb.collection('deals').doc(dealId).update({
      feedbackAnalysis: feedbackData,
      stage: 'S10_complete',
      status: 'closed_won',
      updatedAt: new Date().toISOString(),
    });

    return { dealId, feedbackData, stage: 'S10_complete' };
  }
}
