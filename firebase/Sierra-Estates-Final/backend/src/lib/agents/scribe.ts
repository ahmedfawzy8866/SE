/**
 * Scribe Agent — Stages 1 & 2
 * S1: Intake (raw WhatsApp/Telegram data ingestion)
 * S2: Normalization (AI extraction + valuation)
 */

import { adminDb } from '@/lib/server/firebase-admin';
import { GoogleAIService } from '@/lib/server/google-ai';

const ai = new GoogleAIService();

export class ScribeAgent {
  async run(action: string, payload: Record<string, unknown>): Promise<unknown> {
    switch (action) {
      case 'intake':
        return this.intake(payload);
      case 'normalize':
        return this.normalize(payload);
      default:
        throw new Error(`Unknown Scribe action: ${action}`);
    }
  }

  async intake(payload: Record<string, unknown>) {
    const { message, source, groupName, senderPhone } = payload as {
      message: string;
      source?: string;
      groupName?: string;
      senderPhone?: string;
    };

    const docRef = await adminDb.collection('rawScrapeData').add({
      message,
      source: source || 'manual',
      groupName,
      senderPhone,
      status: 'pending_extraction',
      stage: 'S1_intake',
      createdAt: new Date().toISOString(),
    });

    return { id: docRef.id, stage: 'S1_intake' };
  }

  async normalize(payload: Record<string, unknown>) {
    const { rawId } = payload as { rawId: string };

    const doc = await adminDb.collection('rawScrapeData').doc(rawId).get();
    if (!doc.exists) throw new Error(`Raw data not found: ${rawId}`);

    const data = doc.data()!;
    const extracted = await ai.generateContent(
      `Extract property listing data from this Arabic/English WhatsApp message. Return JSON with:
      compound, bedrooms, bathrooms, area, price, finishingType, furnishingStatus, floor, unitNumber, ownerContact.
      Message: "${data.message}"`
    );

    let parsedData: Record<string, unknown> = {};
    try {
      parsedData = JSON.parse(extracted);
    } catch {
      parsedData = { extractionFailed: true, raw: data.message };
    }

    await adminDb.collection('rawScrapeData').doc(rawId).update({
      parsedData,
      status: parsedData.extractionFailed ? 'failed' : 'extracted',
      stage: 'S2_normalized',
      updatedAt: new Date().toISOString(),
    });

    return { id: rawId, parsedData, stage: 'S2_normalized' };
  }
}
