/**
 * Curator Agent — Stages 3, 4 & 5
 * S3: Branding (title, description, AI tags)
 * S4: Distribution (visibility, portal prep)
 * S5: Portal Sync (Property Finder publish)
 */

import { adminDb } from '@/lib/server/firebase-admin';
import { GoogleAIService } from '@/lib/server/google-ai';
import { PFIntegrationService } from '@/lib/services/PFIntegrationService';

const ai = new GoogleAIService();
const pf = new PFIntegrationService();

export class CuratorAgent {
  async run(action: string, payload: Record<string, unknown>): Promise<unknown> {
    switch (action) {
      case 'brand':
        return this.brand(payload);
      case 'distribute':
        return this.distribute(payload);
      case 'sync':
        return this.syncToPortal(payload);
      default:
        throw new Error(`Unknown Curator action: ${action}`);
    }
  }

  async brand(payload: Record<string, unknown>) {
    const { listingId } = payload as { listingId: string };

    const doc = await adminDb.collection('listings').doc(listingId).get();
    if (!doc.exists) throw new Error(`Listing not found: ${listingId}`);

    const data = doc.data()!;
    const branded = await ai.generateContent(
      `Create luxury real estate branding for this property:\n${JSON.stringify(data, null, 2)}\n\nReturn JSON with: title, titleAr, description, descriptionAr, aiTags[], dealStatus, dealScore`
    );

    let brandData: Record<string, unknown> = {};
    try {
      brandData = JSON.parse(branded);
    } catch {
      brandData = {};
    }

    await adminDb.collection('listings').doc(listingId).update({
      ...brandData,
      stage: 'S3_branded',
      updatedAt: new Date().toISOString(),
    });

    return { listingId, brandData, stage: 'S3_branded' };
  }

  async distribute(payload: Record<string, unknown>) {
    const { listingId, visibility } = payload as { listingId: string; visibility?: string };

    await adminDb.collection('listings').doc(listingId).update({
      visibility: visibility || 'public',
      status: 'active',
      stage: 'S4_distributed',
      updatedAt: new Date().toISOString(),
    });

    return { listingId, visibility, stage: 'S4_distributed' };
  }

  async syncToPortal(payload: Record<string, unknown>) {
    const { listingId } = payload as { listingId: string };
    const result = await pf.publishListing(listingId);

    await adminDb.collection('listings').doc(listingId).update({
      syncedToPF: result.success,
      pfId: result.id || null,
      stage: 'S5_synced',
      updatedAt: new Date().toISOString(),
    });

    return { listingId, result, stage: 'S5_synced' };
  }
}
