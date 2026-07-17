import { adminDb } from '@/lib/server/firebase-admin';
import { GoogleAIService } from '@/lib/server/google-ai';

const ai = new GoogleAIService();

export async function generateCloserHandoff(
  leadId: string,
  assetId: string
): Promise<{ briefing: string; keyPoints: string[] }> {
  const [leadDoc, assetDoc] = await Promise.all([
    adminDb.collection('leads').doc(leadId).get(),
    adminDb.collection('listings').doc(assetId).get(),
  ]);

  if (!leadDoc.exists) throw new Error(`Lead not found: ${leadId}`);
  if (!assetDoc.exists) throw new Error(`Asset not found: ${assetId}`);

  const lead  = leadDoc.data()!;
  const asset = assetDoc.data()!;

  const result = await ai.generateContent(
    `Create a Stage 9 Closer handoff brief for this deal.\n\nStakeholder: ${JSON.stringify(lead)}\nPortfolio Asset: ${JSON.stringify(asset)}\n\nReturn JSON: {briefing: string, keyPoints: string[]}`
  );

  try {
    return JSON.parse(result);
  } catch {
    return { briefing: result, keyPoints: [] };
  }
}

export async function generateAgentBriefing(
  leadId: string
): Promise<string> {
  const doc = await adminDb.collection('leads').doc(leadId).get();
  if (!doc.exists) throw new Error(`Lead not found: ${leadId}`);

  return ai.generateContent(
    `Create a concise agent briefing for this investment stakeholder:\n${JSON.stringify(doc.data())}\n\nHighlight: budget, preferences, urgency, and suggested approach.`
  );
}
