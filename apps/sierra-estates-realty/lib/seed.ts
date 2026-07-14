/**
 * Seed data — fallback when Firebase is not configured.
 * Ported verbatim from the existing static site's data.js so the new
 * single-page client + admin render with real New Cairo compound data
 * on first deploy, before Firestore is wired.
 */
import type { Compound, Listing, Agent } from "./types";

export const SEED_COMPOUNDS: Compound[] = [
  { id: "c01", name: "Katameya Heights", zone: "Katameya", lat: 29.99, lng: 31.48, growth: "+10%", aiScore: 9.0, priceM: 26, rent: 5000, featured: true },
  { id: "c02", name: "Katameya Dunes", zone: "Katameya", lat: 29.985, lng: 31.492, growth: "+12%", aiScore: 8.8, priceM: 18, rent: 3400 },
  { id: "c03", name: "Swan Lake Residence", zone: "5th Settlement", lat: 30.045, lng: 31.635, growth: "+15%", aiScore: 8.9, priceM: 8.5, rent: 1700 },
  { id: "c04", name: "Mivida", zone: "5th Settlement", lat: 30.007, lng: 31.589, growth: "+18%", aiScore: 9.1, priceM: 10.5, rent: 2100, featured: true },
  { id: "c05", name: "Cairo Festival City Residences", zone: "New Cairo", lat: 30.016, lng: 31.469, growth: "+12%", aiScore: 8.7, priceM: 7.5, rent: 1500 },
  { id: "c06", name: "Hyde Park New Cairo", zone: "5th Settlement", lat: 30.008, lng: 31.645, growth: "+22%", aiScore: 9.8, priceM: 28.5, rent: 5200, featured: true },
  { id: "c07", name: "Taj City", zone: "New Cairo", lat: 30.065, lng: 31.531, growth: "+19%", aiScore: 9.5, priceM: 22, rent: 4100, featured: true },
  { id: "c08", name: "Eastown (SODIC)", zone: "5th Settlement", lat: 30.033, lng: 31.606, growth: "+14%", aiScore: 8.6, priceM: 9, rent: 1800 },
  { id: "c09", name: "Mountain View iCity", zone: "5th Settlement", lat: 30.025, lng: 31.65, growth: "+17%", aiScore: 9.2, priceM: 12, rent: 2300 },
  { id: "c10", name: "Zed East (Ora)", zone: "5th Settlement", lat: 30.041, lng: 31.628, growth: "+20%", aiScore: 9.3, priceM: 14, rent: 2600 },
  { id: "c11", name: "Palm Hills New Cairo", zone: "5th Settlement", lat: 30.018, lng: 31.62, growth: "+16%", aiScore: 9.0, priceM: 11, rent: 2200 },
  { id: "c12", name: "The Waterway", zone: "5th Settlement", lat: 30.028, lng: 31.612, growth: "+18%", aiScore: 8.9, priceM: 13, rent: 2400 },
  { id: "c13", name: "Lake View Residence", zone: "5th Settlement", lat: 30.052, lng: 31.582, growth: "+13%", aiScore: 8.5, priceM: 8, rent: 1600 },
  { id: "c14", name: "Fifth Square (Al Marasem)", zone: "5th Settlement", lat: 30.046, lng: 31.617, growth: "+15%", aiScore: 8.7, priceM: 9.5, rent: 1900 },
  { id: "c15", name: "Villette (SODIC)", zone: "5th Settlement", lat: 30.013, lng: 31.633, growth: "+21%", aiScore: 9.4, priceM: 16, rent: 3000, featured: true },
  { id: "c16", name: "Marqaz Capital", zone: "New Cairo", lat: 30.073, lng: 31.55, growth: "+11%", aiScore: 8.4, priceM: 7, rent: 1400 },
  { id: "c17", name: "Mira5", zone: "5th Settlement", lat: 30.061, lng: 31.624, growth: "+14%", aiScore: 8.6, priceM: 8.2, rent: 1700 },
  { id: "c18", name: "Stella New Cairo", zone: "5th Settlement", lat: 30.039, lng: 31.641, growth: "+12%", aiScore: 8.3, priceM: 7.8, rent: 1500 },
  { id: "c19", name: "Stone Residence", zone: "5th Settlement", lat: 30.058, lng: 31.594, growth: "+13%", aiScore: 8.5, priceM: 8.6, rent: 1650 },
  { id: "c20", name: "The Address East", zone: "5th Settlement", lat: 30.071, lng: 31.631, growth: "+16%", aiScore: 8.8, priceM: 10.5, rent: 2000 },
  { id: "c21", name: "Telal East", zone: "New Cairo", lat: 30.082, lng: 31.642, growth: "+15%", aiScore: 8.4, priceM: 7.5, rent: 1450 },
  { id: "c22", name: "River Walk", zone: "5th Settlement", lat: 30.044, lng: 31.622, growth: "+17%", aiScore: 8.7, priceM: 9.8, rent: 1850 },
  { id: "c23", name: "Atrio", zone: "5th Settlement", lat: 30.036, lng: 31.6, growth: "+14%", aiScore: 8.6, priceM: 9.2, rent: 1750 },
  { id: "c24", name: "Pukka", zone: "5th Settlement", lat: 30.049, lng: 31.596, growth: "+13%", aiScore: 8.3, priceM: 7.7, rent: 1500 },
  { id: "c25", name: "Saria", zone: "5th Settlement", lat: 30.032, lng: 31.608, growth: "+12%", aiScore: 8.2, priceM: 7.4, rent: 1450 },
  { id: "c26", name: "Jebal", zone: "New Cairo", lat: 30.078, lng: 31.565, growth: "+11%", aiScore: 8.1, priceM: 6.8, rent: 1350 },
  { id: "c27", name: "Kayan", zone: "New Cairo", lat: 30.085, lng: 31.573, growth: "+12%", aiScore: 8.2, priceM: 7.0, rent: 1400 },
  { id: "c28", name: "Seven Residences", zone: "5th Settlement", lat: 30.041, lng: 31.585, growth: "+13%", aiScore: 8.4, priceM: 8.0, rent: 1550 },
  { id: "c29", name: "Aspen", zone: "5th Settlement", lat: 30.047, lng: 31.59, growth: "+14%", aiScore: 8.5, priceM: 8.4, rent: 1600 },
  { id: "c30", name: "New Giza", zone: "Mokattam", lat: 30.083, lng: 31.514, growth: "+18%", aiScore: 9.0, priceM: 17, rent: 3200, featured: true },
  { id: "c31", name: "Uptown Cairo", zone: "Mokattam", lat: 30.092, lng: 31.508, growth: "+19%", aiScore: 9.2, priceM: 18.5, rent: 3400 },
  { id: "c32", name: "Al Rehab", zone: "Rehab", lat: 30.058, lng: 31.514, growth: "+9%", aiScore: 7.8, priceM: 5.5, rent: 1100 },
  { id: "c33", name: "Mostakbal City", zone: "Mostakbal", lat: 30.118, lng: 31.68, growth: "+16%", aiScore: 8.6, priceM: 8.8, rent: 1700 },
  { id: "c34", name: "L'Avenire", zone: "Mostakbal", lat: 30.124, lng: 31.673, growth: "+15%", aiScore: 8.5, priceM: 8.4, rent: 1650 },
  { id: "c35", name: "Mivan", zone: "Mostakbal", lat: 30.13, lng: 31.686, growth: "+14%", aiScore: 8.3, priceM: 7.9, rent: 1550 },
  { id: "c36", name: "Orascom (O West)", zone: "6th of October", lat: 30.05, lng: 30.97, growth: "+13%", aiScore: 8.7, priceM: 9.5, rent: 1800 },
  { id: "c37", name: "Hyde Park West", zone: "6th of October", lat: 30.04, lng: 30.96, growth: "+12%", aiScore: 8.5, priceM: 8.8, rent: 1700 },
  { id: "c38", name: "Pyramid Hills", zone: "6th of October", lat: 29.96, lng: 31.04, growth: "+11%", aiScore: 8.2, priceM: 7.5, rent: 1450 },
  { id: "c39", name: "Allegria", zone: "6th of October", lat: 29.98, lng: 30.99, growth: "+14%", aiScore: 8.6, priceM: 9.0, rent: 1750 },
  { id: "c40", name: "Smeralda Bay", zone: "North Coast", lat: 31.16, lng: 29.61, growth: "+22%", aiScore: 9.1, priceM: 14, rent: 2600 },
  { id: "c41", name: "Hacienda Bay", zone: "North Coast", lat: 31.14, lng: 29.59, growth: "+20%", aiScore: 8.9, priceM: 12, rent: 2300 },
  { id: "c42", name: "Marassi", zone: "North Coast", lat: 31.18, lng: 29.65, growth: "+21%", aiScore: 9.0, priceM: 13, rent: 2500 },
  { id: "c43", name: "Fouka Bay", zone: "North Coast", lat: 31.21, lng: 29.55, growth: "+18%", aiScore: 8.7, priceM: 10.5, rent: 2000 },
  { id: "c44", name: "Seashell", zone: "North Coast", lat: 31.19, lng: 29.57, growth: "+17%", aiScore: 8.6, priceM: 9.8, rent: 1900 },
  { id: "c45", name: "Cape Bay", zone: "North Coast", lat: 31.22, lng: 29.53, growth: "+19%", aiScore: 8.8, priceM: 11, rent: 2100 },
  { id: "c46", name: "Green Square (Sabbour)", zone: "Mostakbal", lat: 30.116, lng: 31.69, growth: "+13%", aiScore: 8.4, priceM: 8.0, rent: 1600 },
  { id: "c47", name: "Mivida Parks", zone: "5th Settlement", lat: 30.01, lng: 31.595, growth: "+16%", aiScore: 8.8, priceM: 10, rent: 1950 },
  { id: "c48", name: "Fifth Square Boulevard", zone: "5th Settlement", lat: 30.048, lng: 31.62, growth: "+14%", aiScore: 8.5, priceM: 8.7, rent: 1700 },
  { id: "c49", name: "Layan Residence (MNHD)", zone: "Mostakbal", lat: 30.122, lng: 31.683, growth: "+12%", aiScore: 8.2, priceM: 7.6, rent: 1500 },
  { id: "c50", name: "Jayd (IWAN)", zone: "Mostakbal", lat: 30.128, lng: 31.679, growth: "+13%", aiScore: 8.3, priceM: 7.8, rent: 1550 },
  { id: "c51", name: "Sukna", zone: "New Cairo", lat: 30.067, lng: 31.556, growth: "+11%", aiScore: 8.3, priceM: 7.2, rent: 1400 },
  { id: "c52", name: "Bosco", zone: "New Cairo", lat: 30.071, lng: 31.548, growth: "+12%", aiScore: 8.4, priceM: 7.6, rent: 1450 },
];

export const SEED_LISTINGS: Listing[] = [
  { id: "l1", code: "HP-VL-01", compound: "Hyde Park New Cairo", zone: "5th Settlement", type: "Villa", beds: 5, bath: 5, area: 480, egpM: 28.5, usd: 5200, aiScore: 9.8, tag: "Premium", mode: "sale", agent: "Layla Mansour", ago: "2d ago", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=85", status: "available", description: "5BR standalone villa with private garden, pool, and smart-home automation. Direct park view.", featured: true },
  { id: "l2", code: "MVW-TH-02", compound: "Mountain View iCity", zone: "5th Settlement", type: "Twin House", beds: 4, bath: 3, area: 280, egpM: 15.5, usd: 2400, aiScore: 9.6, tag: "Featured", mode: "sale", agent: "Karim Fahmy", ago: "5h ago", img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=85", status: "available", description: "Twin house with roof garden and2-car garage. Walking distance to clubhouse.", featured: true },
  { id: "l3", code: "MV-AP-03", compound: "Mivida", zone: "5th Settlement", type: "Apartment", beds: 3, bath: 2, area: 145, egpM: 6.8, usd: 1650, aiScore: 9.1, tag: "Smart Match", mode: "rent", agent: "Nour Saleh", ago: "1d ago", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=85", status: "available", description: "Fully furnished 3BR apartment overlooking central park. Pool & gym access included." },
  { id: "l4", code: "UPC-PH-04", compound: "Uptown Cairo", zone: "Mokattam", type: "Penthouse", beds: 4, bath: 3, area: 300, egpM: 18.5, usd: 3800, aiScore: 9.5, tag: "Exclusive", mode: "sale", agent: "Omar Magdy", ago: "6h ago", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=85", status: "available", description: "Penthouse with 360° city views, private rooftop, and double-height living room.", featured: true },
  { id: "l5", code: "TAJ-VL-05", compound: "Taj City", zone: "New Cairo", type: "Villa", beds: 5, bath: 5, area: 500, egpM: 35.0, usd: 6500, aiScore: 9.5, tag: "Premium", mode: "sale", agent: "Yara Hakim", ago: "4d ago", img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=85", status: "available", description: "Signature villa with infinity pool, home cinema, and landscaped garden." },
  { id: "l6", code: "VLT-VL-06", compound: "Villette (SODIC)", zone: "5th Settlement", type: "Villa", beds: 4, bath: 4, area: 390, egpM: 24.5, usd: 4400, aiScore: 9.3, tag: "New", mode: "sale", agent: "Rana Adel", ago: "3d ago", img: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=85", status: "available", description: "G-Type villa with basement, private elevator, and mature landscape." },
  { id: "l7", code: "PH-VL-07", compound: "Palm Hills New Cairo", zone: "5th Settlement", type: "Villa", beds: 4, bath: 3, area: 380, egpM: 23.5, usd: 4200, aiScore: 9.2, tag: "Best ROI", mode: "sale", agent: "Layla Mansour", ago: "1w ago", img: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=85", status: "available", description: "Stand-alone villa with golf-course frontage. Strong rental yield track record." },
  { id: "l8", code: "EST-DX-08", compound: "Eastown (SODIC)", zone: "5th Settlement", type: "Duplex", beds: 3, bath: 2, area: 220, egpM: 11.5, usd: 2400, aiScore: 9.1, tag: null, mode: "rent", agent: "Karim Fahmy", ago: "2d ago", img: "https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&q=85", status: "available", description: "Spacious duplex with terrace and 2 parking spots. Walk to cafes." },
];

export const SEED_AGENTS: Agent[] = [
  { id: "a1", name: "Layla Mansour", phone: "+20 100 123 4567", email: "layla@sierra-estates.net", avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&q=80", rating: 4.9, listingsCount: 18 },
  { id: "a2", name: "Karim Fahmy", phone: "+20 100 234 5678", email: "karim@sierra-estates.net", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80", rating: 4.8, listingsCount: 14 },
  { id: "a3", name: "Nour Saleh", phone: "+20 100 345 6789", email: "nour@sierra-estates.net", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80", rating: 4.9, listingsCount: 11 },
  { id: "a4", name: "Omar Magdy", phone: "+20 100 456 7890", email: "omar@sierra-estates.net", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80", rating: 4.7, listingsCount: 9 },
  { id: "a5", name: "Yara Hakim", phone: "+20 100 567 8901", email: "yara@sierra-estates.net", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80", rating: 4.8, listingsCount: 13 },
  { id: "a6", name: "Rana Adel", phone: "+20 100 678 9012", email: "rana@sierra-estates.net", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&q=80", rating: 4.7, listingsCount: 8 },
];

export const SEED_INQUIRY_STATUSES = [
  "new", "contacted", "toured", "offer", "closed", "lost"
] as const;

export const PROPERTY_TYPES = [
  "Apartment", "Villa", "Twin House", "Townhouse", "Penthouse", "Duplex", "Studio"
] as const;

export const COMPOUND_ZONES = [
  "5th Settlement", "New Cairo", "Katameya", "Mokattam", "Rehab", "Mostakbal"
] as const;
