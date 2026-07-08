import { z } from 'zod';
import pino from 'pino';

const logger = pino({ name: 'openclaw-agent' });

// Define the schema for a real estate unit to be extracted from WhatsApp messages
export const UnitExtractionSchema = z.object({
  type: z.string().describe('The type of property, e.g., Apartment, Villa, Office, etc.'),
  location: z.string().describe('The location or address of the property'),
  price: z.number().optional().describe('The price or budget mentioned (as a number)'),
  currency: z.string().optional().describe('The currency mentioned, e.g., USD, EGP'),
  area_sqm: z.number().optional().describe('The area in square meters'),
  bedrooms: z.number().optional().describe('Number of bedrooms'),
  bathrooms: z.number().optional().describe('Number of bathrooms'),
  contact_info: z.string().optional().describe('Phone number or name of the owner'),
  notes: z.string().optional().describe('Any other relevant notes or details'),
});

export type ExtractedUnit = z.infer<typeof UnitExtractionSchema>;

/**
 * OpenClaw Agent Class
 * Responsible for handling incoming WhatsApp messages, extracting unit data using AI,
 * and pushing it to Airtable or an Excel sheet.
 */
export class OpenClawAgent {
  private airtableApiKey: string;
  private airtableBaseId: string;
  private airtableTableName: string;
  private aiApiKey: string; // e.g., OpenAI API Key

  constructor(config: { airtableApiKey: string; airtableBaseId: string; airtableTableName: string; aiApiKey: string }) {
    this.airtableApiKey = config.airtableApiKey;
    this.airtableBaseId = config.airtableBaseId;
    this.airtableTableName = config.airtableTableName;
    this.aiApiKey = config.aiApiKey;
  }

  /**
   * Parses the text using an AI API (e.g., OpenAI or Gemini) to extract structured unit data
   */
  async extractUnitData(text: string): Promise<ExtractedUnit | null> {
    logger.info({ msg: 'Extracting unit data from text', textLength: text.length });

    try {
      const source = text.trim();
      if (!source) return null;

      const typeMatch = source.match(/\b(apartment|villa|office|duplex|penthouse|studio|townhouse|shop)\b/i);
      const locationMatch =
        source.match(/\b(?:in|at|location[:\s-]+)\s*([A-Za-z0-9][A-Za-z0-9\s,.'-]{1,80})/i) ||
        source.match(/\b(?:compound|district|area)[:\s-]+([A-Za-z0-9][A-Za-z0-9\s,.'-]{1,80})/i);

      const priceMatch = source.match(/\b(?:price|budget|for)\s*[:\-]?\s*(?:EGP|USD|AED)?\s*([0-9][0-9,]*)\b/i);
      const bedroomsMatch = source.match(/\b(\d{1,2})\s*(?:bed|bedroom|br)\b/i);
      const bathroomsMatch = source.match(/\b(\d{1,2})\s*(?:bath|bathroom)\b/i);
      const areaMatch = source.match(/\b([0-9]{2,4})\s*(?:sqm|m2|m²)\b/i);
      const contactMatch = source.match(/\b(?:\+?\d{8,15}|wa\.?me\/\d{8,15})\b/i);
      const currencyMatch = source.match(/\b(EGP|USD|AED|SAR|EUR)\b/i);

      const extracted: Partial<ExtractedUnit> = {
        type: typeMatch?.[1],
        location: locationMatch?.[1]?.trim(),
        price: priceMatch?.[1] ? Number(priceMatch[1].replaceAll(',', '')) : undefined,
        bedrooms: bedroomsMatch?.[1] ? Number(bedroomsMatch[1]) : undefined,
        bathrooms: bathroomsMatch?.[1] ? Number(bathroomsMatch[1]) : undefined,
        area_sqm: areaMatch?.[1] ? Number(areaMatch[1]) : undefined,
        contact_info: contactMatch?.[0],
        currency: currencyMatch?.[1]?.toUpperCase(),
      };

      const parsed = UnitExtractionSchema.safeParse(extracted);
      if (!parsed.success) return null;

      return parsed.data;
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to extract unit data' });
      return null;
    }
  }

  /**
   * Pushes the extracted unit data to Airtable
   */
  async pushToAirtable(unit: ExtractedUnit): Promise<boolean> {
    logger.info({ msg: 'Pushing unit data to Airtable', unitType: unit.type, location: unit.location });
    
    try {
      const encodedTableName = encodeURIComponent(this.airtableTableName);
      const response = await fetch(`https://api.airtable.com/v0/${this.airtableBaseId}/${encodedTableName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.airtableApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                "Property Type": unit.type,
                "Location": unit.location,
                "Price": unit.price,
                "Currency": unit.currency,
                "Area (sqm)": unit.area_sqm,
                "Bedrooms": unit.bedrooms,
                "Bathrooms": unit.bathrooms,
                "Contact": unit.contact_info,
                "Notes": unit.notes
              }
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error({ msg: 'Airtable API error', error: errorText });
        return false;
      }

      logger.info({ msg: 'Successfully pushed to Airtable' });
      return true;
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to connect to Airtable' });
      return false;
    }
  }

  /**
   * Main entry point for a WhatsApp webhook
   */
  async handleWhatsAppMessage(messageText: string, sender: string): Promise<string> {
    logger.info({ msg: 'Received WhatsApp message', hasSender: sender.length > 0, messageLength: messageText.length });
    
    const unitData = await this.extractUnitData(messageText);
    
    if (!unitData || !unitData.location) {
      logger.info({ msg: 'Could not extract unit from message, ignoring.' });
      return 'Sorry, I couldn\'t extract a real estate unit from this message.';
    }
    
    if (!unitData.contact_info) {
      unitData.contact_info = sender;
    }

    const success = await this.pushToAirtable(unitData);
    
    if (success) {
      return `✅ Unit successfully added to the database!\n\nType: ${unitData.type}\nLocation: ${unitData.location}`;
    } else {
      return '❌ Failed to save the unit to the database. Please try again later.';
    }
  }
}
