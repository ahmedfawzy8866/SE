import { adminDb } from '@/lib/server/firebase-admin';
import { GoogleAIService } from '@/lib/server/google-ai';
import crypto from 'crypto';

const ai = new GoogleAIService();

export class WhatsAppParserService {
  async parseMessage(message: string): Promise<Record<string, unknown> | null> {
    try {
      const result = await ai.generateContent(
        `Extract property listing data from this WhatsApp message (Arabic or English).\nReturn JSON or null if not a property listing.\nFields: compound, bedrooms, bathrooms, area, price, finishingType, furnishingStatus, floor, unitNumber, ownerContact, notes\nMessage: "${message}"`
      );

      const cleaned = result.trim().replace(/^```json\n?|```$/g, '');
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }

  async checkDuplicate(message: string): Promise<boolean> {
    const hash = crypto.createHash('sha256').update(message.trim()).digest('hex');

    const snap = await adminDb
      .collection('rawScrapeData')
      .where('messageHash', '==', hash)
      .limit(1)
      .get();

    return !snap.empty;
  }
}
