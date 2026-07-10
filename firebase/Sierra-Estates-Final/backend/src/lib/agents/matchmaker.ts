/**
 * Matchmaker Agent — Stages 6, 7 & 8
 * S6: Lead Profiling (requirements extraction)
 * S7: Neural Synthesis (AI matching score)
 * S8: Proposal Generation
 */

import { adminDb } from '@/lib/server/firebase-admin';
import { GoogleAIService } from '@/lib/server/google-ai';
import { runMatchingForLead } from '@/lib/services/matching-engine';

const ai = new GoogleAIService();

export class MatchmakerAgent {
  async run(action: string, payload: Record<string, unknown>): Promise<unknown> {
    switch (action) {
      case 'profile':
        return this.profileLead(payload);
      case 'match':
        return this.matchNeural(payload);
      case 'propose':
        return this.generateProposal(payload);
      default:
        throw new Error(`Unknown Matchmaker action: ${action}`);
    }
  }

  async profileLead(payload: Record<string, unknown>) {
    const { leadId } = payload as { leadId: string };

    const doc = await adminDb.collection('leads').doc(leadId).get();
    if (!doc.exists) throw new Error(`Lead not found: ${leadId}`);

    const data = doc.data()!;
    const profile = await ai.generateContent(
      `Analyze this real estate lead and extract investment profile:\n${JSON.stringify(data)}\n\nReturn JSON: investmentIntent, riskTolerance, budgetRange, preferredAreas, decisionTimeline, qualificationScore`
    );

    let profileData: Record<string, unknown> = {};
    try { profileData = JSON.parse(profile); } catch { profileData = {}; }

    await adminDb.collection('leads').doc(leadId).update({
      investmentProfile: profileData,
      stage: 'S6_profiled',
      updatedAt: new Date().toISOString(),
    });

    return { leadId, profileData, stage: 'S6_profiled' };
  }

  async matchNeural(payload: Record<string, unknown>) {
    const { leadId } = payload as { leadId: string };
    const matches = await runMatchingForLead(leadId);

    await adminDb.collection('leads').doc(leadId).update({
      matchedAssets: matches,
      stage: 'S7_matched',
      updatedAt: new Date().toISOString(),
    });

    return { leadId, matches, stage: 'S7_matched' };
  }

  async generateProposal(payload: Record<string, unknown>) {
    const { leadId, assetId } = payload as { leadId: string; assetId: string };

    const [leadDoc, assetDoc] = await Promise.all([
      adminDb.collection('leads').doc(leadId).get(),
      adminDb.collection('listings').doc(assetId).get(),
    ]);

    if (!leadDoc.exists || !assetDoc.exists) throw new Error('Lead or asset not found');

    const proposalText = await ai.generateContent(
      `Generate a luxury property investment proposal for:\nClient: ${JSON.stringify(leadDoc.data())}\nProperty: ${JSON.stringify(assetDoc.data())}\n\nCreate a compelling, professional proposal in English.`
    );

    const proposalRef = await adminDb.collection('proposals').add({
      leadId,
      assetId,
      proposalText,
      stage: 'S8_proposed',
      status: 'draft',
      createdAt: new Date().toISOString(),
    });

    return { proposalId: proposalRef.id, proposalText, stage: 'S8_proposed' };
  }
}
