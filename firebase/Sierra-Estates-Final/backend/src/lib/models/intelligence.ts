export interface IntelligentAsset {
  id: string;
  compound: string;
  price: number;
  pricePerSqm: number;
  area: number;
  bedrooms: number;
  dealScore: number;
  roiEstimate: number;
  capitalGrowthRate?: number;
  rentalYield?: number;
  marketPosition?: 'below_market' | 'at_market' | 'above_market';
  aiInsights?: string;
  tags?: string[];
}
