import { adminDb } from '@/lib/server/firebase-admin';
import { sendTelegramMessage } from './telegram-controller';
import { runMatchingForLead } from './matching-engine';

export class OrchestratorService {
  async run(input: Record<string, unknown>): Promise<unknown> {
    const { type, payload } = input as { type: string; payload: Record<string, unknown> };

    switch (type) {
      case 'new_lead':
        return this.processNewLead(payload);
      case 'new_listing':
        return this.processNewListing(payload);
      case 'viewing_complete':
        return this.processViewingComplete(payload);
      default:
        throw new Error(`Unknown orchestration type: ${type}`);
    }
  }

  private async processNewLead(payload: Record<string, unknown>) {
    const { leadId } = payload as { leadId: string };

    try {
      // S1: Intake already done (lead exists)
      // S6–S8: Run matching
      const matches = await runMatchingForLead(leadId);

      await adminDb.collection('leads').doc(leadId).update({
        matchedAssets: matches.map(m => m.assetId),
        stage: 'S7_matched',
        updatedAt: new Date().toISOString(),
      });

      if (matches.length > 0) {
        await sendTelegramMessage(
          `🧠 *Matching Complete*\n\nLead: ${leadId}\n🎯 ${matches.length} matches found\n📊 Top match score: ${matches[0]?.score || 0}%`
        );
      }

      return { leadId, matches, stage: 'S7_matched' };
    } catch (err) {
      // DLQ
      await adminDb.collection('syncQueue').add({
        type: 'new_lead_retry',
        payload,
        error: String(err),
        status: 'failed',
        createdAt: new Date().toISOString(),
      });
      throw err;
    }
  }

  private async processNewListing(payload: Record<string, unknown>) {
    const { listingId } = payload as { listingId: string };

    // Run reverse matching: find leads for this listing
    const snap = await adminDb
      .collection('leads')
      .where('status', 'in', ['active', 'warm', 'hot'])
      .limit(20)
      .get();

    const notified: string[] = [];
    for (const leadDoc of snap.docs) {
      const lead = leadDoc.data();
      const listing = (await adminDb.collection('listings').doc(listingId).get()).data();

      if (listing && lead.preferredCompounds?.includes(listing.compound)) {
        notified.push(leadDoc.id);
      }
    }

    return { listingId, notifiedLeads: notified.length };
  }

  private async processViewingComplete(payload: Record<string, unknown>) {
    const { viewingId, outcome } = payload as { viewingId: string; outcome: string };

    await adminDb.collection('viewingRequests').doc(viewingId).update({
      status: 'completed',
      outcome,
      completedAt: new Date().toISOString(),
    });

    return { viewingId, outcome, stage: 'viewing_complete' };
  }
}
