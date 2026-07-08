import { adminDb } from '@/lib/server/firebase-admin';

export class MemoryService {
  async recordRejection(
    leadId: string,
    assetId: string,
    reason?: string
  ): Promise<void> {
    await adminDb.collection('memory').add({
      type: 'rejection',
      leadId,
      assetId,
      reason: reason || 'Not specified',
      recordedAt: new Date().toISOString(),
    });
  }

  async getGlobalTrends(): Promise<Record<string, unknown>> {
    const snap = await adminDb
      .collection('memory')
      .where('type', '==', 'rejection')
      .orderBy('recordedAt', 'desc')
      .limit(100)
      .get();

    const rejections = snap.docs.map(d => d.data());

    // Count rejections per compound
    const compoundRejections: Record<string, number> = {};
    for (const r of rejections) {
      const compound = String(r.compound || 'unknown');
      compoundRejections[compound] = (compoundRejections[compound] || 0) + 1;
    }

    return {
      totalRejections: rejections.length,
      compoundRejections,
      lastUpdated: new Date().toISOString(),
    };
  }
}
