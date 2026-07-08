const PF_API_BASE = process.env.PROPERTY_FINDER_API_BASE || 'https://api.propertyfinder.com.eg/v3';

export class PropertyFinderService {
  private static instance: PropertyFinderService;

  static getInstance(): PropertyFinderService {
    if (!PropertyFinderService.instance) {
      PropertyFinderService.instance = new PropertyFinderService();
    }
    return PropertyFinderService.instance;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${process.env.PROPERTY_FINDER_JWT_TOKEN}`,
      'Content-Type':  'application/json',
    };
  }

  async get(endpoint: string, params: Record<string, string> = {}): Promise<unknown> {
    const qs = new URLSearchParams(params).toString();
    const url = `${PF_API_BASE}/${endpoint}${qs ? '?' + qs : ''}`;
    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) throw new Error(`PF GET ${endpoint} failed: ${res.status}`);
    return res.json();
  }

  async post(endpoint: string, data: unknown): Promise<unknown> {
    const res = await fetch(`${PF_API_BASE}/${endpoint}`, {
      method:  'POST',
      headers: this.getHeaders(),
      body:    JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`PF POST ${endpoint} failed: ${res.status}`);
    return res.json();
  }

  async put(endpoint: string, data: unknown): Promise<unknown> {
    const res = await fetch(`${PF_API_BASE}/${endpoint}`, {
      method:  'PUT',
      headers: this.getHeaders(),
      body:    JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`PF PUT ${endpoint} failed: ${res.status}`);
    return res.json();
  }

  async delete(endpoint: string): Promise<unknown> {
    const res = await fetch(`${PF_API_BASE}/${endpoint}`, {
      method:  'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`PF DELETE ${endpoint} failed: ${res.status}`);
    return res.json();
  }
}
