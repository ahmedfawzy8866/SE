import { PROPERTIES } from "./properties";

export interface MapNode {
  id: string;
  name: string;
  nameAr: string;
  coords: [number, number];
  units: number;
  priceResale: string;
  priceRent: string;
  priceNumeric: number;
  ai: number;
  zone: string;
}

export const MAP_NODES: MapNode[] = PROPERTIES.map((p) => {
  // Estimate rent based on yield
  const yearlyRent = p.price * (p.yieldPercent / 100);
  const formattedRent = `$${(yearlyRent / 1000).toFixed(0)}k/yr`;

  return {
    id: p.id,
    name: p.compound,
    nameAr: p.compound, // Could be translated if needed
    coords: [p.lat, p.lng],
    units: Math.floor(Math.random() * 50) + 10, // Mock units count based on the user's snippet design
    priceResale: p.priceLabel,
    priceRent: formattedRent,
    priceNumeric: p.price,
    ai: p.aiScore,
    zone: p.location,
  };
});
