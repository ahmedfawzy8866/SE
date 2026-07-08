// Stub: Portfolio engine types
// TODO: Replace with actual implementation

export interface ConciergeUnit {
  id: string;
  title: string;
  description: string;
  price: number;
  estimatedROI: number;
  compound: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  imageUrl?: string;
  features?: string[];
}

export interface ConciergeSelection {
  id: string;
  leadId: string;
  units: ConciergeUnit[];
  curatedAt: string;
  advisorNote?: string;
  status: 'active' | 'expired' | 'viewed';
  engagement?: Record<string, unknown>;
}
