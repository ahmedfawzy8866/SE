import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/server/auth-guard';
import { adminDb } from '@/lib/server/firebase-admin';
import { GoogleAIService } from '@/lib/server/google-ai';
import { SheetsIntegrationService } from '@/lib/services/SheetsIntegrationService';

const ai = new GoogleAIService();
const sheets = new SheetsIntegrationService();

export async function POST(req: NextRequest) {
  const authResult = await verifyRequest(req);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const body = await req.json();
  const { message, source, groupName, senderPhone } = body;

  if (!message) {
    return NextResponse.json({ error: 'Missing message' }, { status: 400 });
  }

  try {
    // AI-parse the WhatsApp message for property data
    const parsed = await ai.generateContent(
      `Extract property listing data from this WhatsApp message. Return JSON with fields: compound, bedrooms, bathrooms, area, price, finishingType, furnishingStatus, floor, unitNumber, ownerContact, notes. Message: "${message}"`
    );

    let propertyData: Record<string, unknown> = {};
    try {
      propertyData = JSON.parse(parsed);
    } catch {
      propertyData = { raw: message };
    }

    // Store in Firestore
    const docRef = await adminDb.collection('rawScrapeData').add({
      message,
      source: source || 'whatsapp',
      groupName,
      senderPhone,
      parsedData: propertyData,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
    });

    // Dual-ingest to Google Sheets
    await sheets.appendRow('raw_messages', [
      new Date().toISOString(),
      senderPhone || '',
      groupName || '',
      message.substring(0, 500),
      'NO',
      'PENDING_REVIEW',
    ]);

    return NextResponse.json({ success: true, id: docRef.id, parsed: propertyData });
  } catch (err) {
    console.error('[ingest/whatsapp] error:', err);
    return NextResponse.json({ error: 'Ingestion failed' }, { status: 500 });
  }
}
