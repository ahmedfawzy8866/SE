/**
 * SheetsIntegrationService — Google Sheets CSV sync + row append
 * Uses the Sheets REST API with a service account.
 */

export class SheetsIntegrationService {
  private sheetId: string;
  private serviceAccountKey: Record<string, unknown> | null;

  constructor() {
    this.sheetId = process.env.BROKER_INBOX_SHEET_ID || '';
    this.serviceAccountKey = this.loadServiceAccount();
  }

  private loadServiceAccount(): Record<string, unknown> | null {
    const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!keyPath) return null;
    try {
      // In production, this would be a file path or JSON string
      return typeof keyPath === 'string' && keyPath.startsWith('{') ? JSON.parse(keyPath) : null;
    } catch {
      return null;
    }
  }

  async appendRow(tabName: string, values: string[]): Promise<void> {
    if (!this.sheetId || !this.serviceAccountKey) {
      console.warn('[SheetsIntegrationService] Not configured, skipping sheet append');
      return;
    }

    // Placeholder: in production, use googleapis client
    console.log(`[SheetsIntegrationService] Would append to ${tabName}:`, values);
  }

  async getRows(tabName: string, range: string): Promise<string[][]> {
    if (!this.sheetId || !this.serviceAccountKey) {
      console.warn('[SheetsIntegrationService] Not configured, returning empty rows');
      return [];
    }

    // Placeholder
    console.log(`[SheetsIntegrationService] Would get rows from ${tabName}!${range}`);
    return [];
  }
}
