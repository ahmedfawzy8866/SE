import { adminDb } from '@/lib/server/firebase-admin';
import { GoogleAIService } from '@/lib/server/google-ai';

const ai = new GoogleAIService();

export async function generateOptionsPackage(
  leadId: string,
  assetIds: string[]
): Promise<Record<string, unknown>> {
  const [leadDoc, ...assetDocs] = await Promise.all([
    adminDb.collection('leads').doc(leadId).get(),
    ...assetIds.map(id => adminDb.collection('listings').doc(id).get()),
  ]);

  const lead   = leadDoc.data() || {};
  const assets = assetDocs.filter(d => d.exists).map(d => ({ id: d.id, ...d.data() }));

  const result = await ai.generateContent(
    `Generate a curated options package for this investment stakeholder:\n\nStakeholder: ${JSON.stringify(lead)}\nOptions: ${JSON.stringify(assets)}\n\nReturn JSON with a compelling narrative and comparison table.`
  );

  try { return JSON.parse(result); }
  catch { return { narrative: result, assets }; }
}

export async function generateConciergeSelection(
  leadId: string
): Promise<Record<string, unknown>> {
  const snap = await adminDb
    .collection('listings')
    .where('status', '==', 'active')
    .where('dealScore', '>=', 8)
    .limit(3)
    .get();

  const topAssets = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  await adminDb.collection('concierge_selections').add({
    leadId,
    assets: topAssets.map(a => a.id),
    createdAt: new Date().toISOString(),
  });

  return { leadId, selectedAssets: topAssets };
}
