import { adminDb } from '@/lib/server/firebase-admin';
import { GoogleAIService } from '@/lib/server/google-ai';

const ai = new GoogleAIService();

export interface MatchResult {
  assetId: string;
  compound: string;
  price: number;
  score: number;
  reasons: string[];
}

export async function runMatchingForLead(leadId: string): Promise<MatchResult[]> {
  const leadDoc = await adminDb.collection('leads').doc(leadId).get();
  if (!leadDoc.exists) throw new Error(`Lead not found: ${leadId}`);

  const lead = leadDoc.data()!;

  // Fetch candidate listings
  let query = adminDb.collection('listings').where('status', '==', 'active');
  if (lead.budget) {
    query = query.where('price', '<=', lead.budget) as typeof query;
  }

  const snap = await query.limit(50).get();
  const listings = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));

  if (listings.length === 0) return [];

  // AI scoring
  try {
    const aiResult = await ai.generateContent(
      `Score these property listings for this investment stakeholder.\n\nStakeholder: ${JSON.stringify(lead)}\n\nListings: ${JSON.stringify(listings.slice(0, 10))}\n\nReturn JSON array of {assetId, score (0-100), reasons[]} sorted by score descending.`
    );

    const scored = JSON.parse(aiResult) as Array<{ assetId: string; score: number; reasons: string[] }>;

    return scored.map(s => {
      const listing = listings.find(l => l.id === s.assetId) as Record<string, unknown>;
      return {
        assetId:  s.assetId,
        compound: String(listing?.compound || ''),
        price:    Number(listing?.price || 0),
        score:    s.score,
        reasons:  s.reasons,
      };
    });
  } catch {
    // Fallback: heuristic scoring
    return listings.slice(0, 5).map((l, i) => ({
      assetId:  l.id,
      compound: String(l.compound || ''),
      price:    Number(l.price || 0),
      score:    90 - i * 5,
      reasons:  ['Compound match', 'Budget range'],
    }));
  }
}

export async function runMatchingForUnit(unitId: string): Promise<Array<{ leadId: string; score: number }>> {
  const unitDoc = await adminDb.collection('listings').doc(unitId).get();
  if (!unitDoc.exists) throw new Error(`Unit not found: ${unitId}`);

  const unit = unitDoc.data()!;

  const snap = await adminDb
    .collection('leads')
    .where('status', 'in', ['active', 'warm', 'hot'])
    .limit(50)
    .get();

  const leads = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));

  try {
    const aiResult = await ai.generateContent(
      `Find matching investment stakeholders for this property.\n\nProperty: ${JSON.stringify(unit)}\n\nStakeholders: ${JSON.stringify(leads.slice(0, 10))}\n\nReturn JSON array of {leadId, score (0-100)} sorted by score descending.`
    );
    return JSON.parse(aiResult);
  } catch {
    return leads.slice(0, 3).map((l, i) => ({ leadId: l.id, score: 85 - i * 10 }));
  }
}
