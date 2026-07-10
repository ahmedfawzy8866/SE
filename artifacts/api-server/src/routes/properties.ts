import { Router, type IRouter } from "express";

const router: IRouter = Router();

// ── Curated real New Cairo / New Capital properties ──────────────────────────
// Based on real compound data: Hyde Park, Mivida, Mountain View, Uptown Cairo,
// Fifth Square, Madinaty, El Shorouk Springs, Villette, SODIC East, Palm Hills
const PROPERTIES = [
  {
    id: "pf-001",
    title: "Standalone Villa — Hyde Park",
    title_ar: "فيلا مستقلة — هايد بارك",
    compound: "Hyde Park",
    location: "New Cairo, 5th Settlement",
    location_ar: "القاهرة الجديدة، التجمع الخامس",
    purpose: "for-sale",
    category: "villa",
    price: 34500000,
    currency: "EGP",
    area: 450,
    bedrooms: 5,
    bathrooms: 4,
    floors: 3,
    ai_score: 9.8,
    ai_label: "Top Pick",
    delivery_year: 2025,
    tags: ["Pool", "Garden", "Smart Home", "Golf View"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=85",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=85",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=85",
    ],
    lat: 30.0256, lng: 31.4719,
    source: "sierra-curated",
  },
  {
    id: "pf-002",
    title: "Twin House — Mountain View iCity",
    title_ar: "توين هاوس — ماونتن فيو آي سيتي",
    compound: "Mountain View iCity",
    location: "New Cairo, 5th Settlement",
    location_ar: "القاهرة الجديدة، التجمع الخامس",
    purpose: "for-sale",
    category: "twin-house",
    price: 18500000,
    currency: "EGP",
    area: 280,
    bedrooms: 4,
    bathrooms: 3,
    floors: 2,
    ai_score: 9.6,
    ai_label: "High Yield",
    delivery_year: 2026,
    tags: ["Lake View", "Clubhouse", "Kids Area", "24/7 Security"],
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=85",
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=85",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=85",
    ],
    lat: 30.0388, lng: 31.4843,
    source: "sierra-curated",
  },
  {
    id: "pf-003",
    title: "Luxury Villa — Uptown Cairo",
    title_ar: "فيلا فاخرة — أبتاون القاهرة",
    compound: "Uptown Cairo",
    location: "Mokattam, Cairo",
    location_ar: "المقطم، القاهرة",
    purpose: "for-sale",
    category: "villa",
    price: 42000000,
    currency: "EGP",
    area: 620,
    bedrooms: 6,
    bathrooms: 5,
    floors: 3,
    ai_score: 9.5,
    ai_label: "Capital Growth",
    delivery_year: 2025,
    tags: ["Panoramic View", "Infinity Pool", "Sky Terrace", "Private Garden"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=85",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=85",
    ],
    lat: 29.9817, lng: 31.4326,
    source: "sierra-curated",
  },
  {
    id: "pf-004",
    title: "Penthouse Duplex — Mivida",
    title_ar: "بنتهاوس دوبلكس — ميفيدا",
    compound: "Mivida",
    location: "New Cairo, 5th Settlement",
    location_ar: "القاهرة الجديدة، التجمع الخامس",
    purpose: "for-sale",
    category: "penthouse",
    price: 9800000,
    currency: "EGP",
    area: 220,
    bedrooms: 3,
    bathrooms: 3,
    floors: 1,
    ai_score: 9.1,
    ai_label: "Best Value",
    delivery_year: 2024,
    tags: ["Private Roof", "Open Kitchen", "Park View", "Gym Access"],
    images: [
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=85",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=85",
    ],
    lat: 30.0210, lng: 31.4564,
    source: "sierra-curated",
  },
  {
    id: "pf-005",
    title: "Chalet Villa — Villette",
    title_ar: "شاليه فيلا — فيليت",
    compound: "Villette",
    location: "New Cairo, 5th Settlement",
    location_ar: "القاهرة الجديدة، التجمع الخامس",
    purpose: "for-sale",
    category: "villa",
    price: 31000000,
    currency: "EGP",
    area: 380,
    bedrooms: 5,
    bathrooms: 4,
    floors: 2,
    ai_score: 9.3,
    ai_label: "Expat Favorite",
    delivery_year: 2026,
    tags: ["Lagoon View", "Sandy Beach", "Water Park", "Retail Strip"],
    images: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=85",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=85",
    ],
    lat: 30.0285, lng: 31.4882,
    source: "sierra-curated",
  },
  {
    id: "pf-006",
    title: "Corner Villa — Fifth Square",
    title_ar: "فيلا كورنر — فيفث سكوير",
    compound: "Fifth Square",
    location: "New Cairo, Al Andalus District",
    location_ar: "القاهرة الجديدة، حي الأندلس",
    purpose: "for-sale",
    category: "villa",
    price: 21500000,
    currency: "EGP",
    area: 320,
    bedrooms: 4,
    bathrooms: 4,
    floors: 2,
    ai_score: 8.9,
    ai_label: "Growing Area",
    delivery_year: 2027,
    tags: ["Corner Unit", "Mall Access", "Central Park", "Double Garage"],
    images: [
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=85",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=85",
    ],
    lat: 30.0180, lng: 31.4790,
    source: "sierra-curated",
  },
  {
    id: "pf-007",
    title: "Villa for Rent — El Shorouk Springs",
    title_ar: "فيلا للإيجار — الشروق سبرينجز",
    compound: "Al Shorouk Springs",
    location: "El Shorouk City, Cairo",
    location_ar: "مدينة الشروق، القاهرة",
    purpose: "for-rent",
    category: "villa",
    price: 55000,
    currency: "EGP/month",
    area: 400,
    bedrooms: 5,
    bathrooms: 4,
    floors: 3,
    ai_score: 9.0,
    ai_label: "Rental Gem",
    delivery_year: 2020,
    tags: ["Private Pool", "Garden", "Security", "Clubhouse"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=85",
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=85",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=85",
    ],
    lat: 30.1070, lng: 31.6100,
    source: "sierra-curated",
  },
  {
    id: "pf-008",
    title: "Studio Apartment — Madinaty",
    title_ar: "شقة استوديو — مدينتي",
    compound: "Madinaty",
    location: "Madinaty, New Cairo",
    location_ar: "مدينتي، القاهرة الجديدة",
    purpose: "for-sale",
    category: "apartment",
    price: 2800000,
    currency: "EGP",
    area: 85,
    bedrooms: 1,
    bathrooms: 1,
    floors: 1,
    ai_score: 8.6,
    ai_label: "Entry Level",
    delivery_year: 2024,
    tags: ["Ready to Move", "Golf Course", "Schools", "Medical Center"],
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=85",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=85",
    ],
    lat: 30.1015, lng: 31.5992,
    source: "sierra-curated",
  },
  {
    id: "pf-009",
    title: "Standalone Villa — SODIC East",
    title_ar: "فيلا مستقلة — سوديك إيست",
    compound: "SODIC East",
    location: "New Cairo, Shorouk Extension",
    location_ar: "القاهرة الجديدة، امتداد الشروق",
    purpose: "for-sale",
    category: "villa",
    price: 26000000,
    currency: "EGP",
    area: 360,
    bedrooms: 5,
    bathrooms: 4,
    floors: 2,
    ai_score: 9.2,
    ai_label: "Smart Investment",
    delivery_year: 2026,
    tags: ["British School", "Commercial Hub", "Green Spaces", "Fiber Optic"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=85",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=85",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=85",
    ],
    lat: 30.0620, lng: 31.6180,
    source: "sierra-curated",
  },
  {
    id: "pf-010",
    title: "Sky Villa — Palm Hills New Cairo",
    title_ar: "سكاي فيلا — بالم هيلز",
    compound: "Palm Hills New Cairo",
    location: "New Cairo, 5th Settlement",
    location_ar: "القاهرة الجديدة، التجمع الخامس",
    purpose: "for-sale",
    category: "villa",
    price: 24500000,
    currency: "EGP",
    area: 340,
    bedrooms: 4,
    bathrooms: 4,
    floors: 2,
    ai_score: 9.2,
    ai_label: "Gulf Investor Pick",
    delivery_year: 2026,
    tags: ["Country Club", "Tennis Court", "Padel", "Spa"],
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=85",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=85",
    ],
    lat: 30.0330, lng: 31.4780,
    source: "sierra-curated",
  },
  {
    id: "pf-011",
    title: "Penthouse — Katameya Heights",
    title_ar: "بنتهاوس — قطاميا هايتس",
    compound: "Katameya Heights",
    location: "New Cairo, Katameya",
    location_ar: "القاهرة الجديدة، قطاميا",
    purpose: "for-sale",
    category: "penthouse",
    price: 38000000,
    currency: "EGP",
    area: 520,
    bedrooms: 5,
    bathrooms: 5,
    floors: 1,
    ai_score: 9.5,
    ai_label: "Ultra Luxury",
    delivery_year: 2024,
    tags: ["Golf Club", "Private Elevator", "Rooftop Pool", "Full Finishing"],
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=85",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=85",
    ],
    lat: 29.9958, lng: 31.4358,
    source: "sierra-curated",
  },
  {
    id: "pf-012",
    title: "Town House — Eastown",
    title_ar: "تاون هاوس — إيستاون",
    compound: "Eastown",
    location: "New Cairo, 5th Settlement",
    location_ar: "القاهرة الجديدة، التجمع الخامس",
    purpose: "for-sale",
    category: "townhouse",
    price: 14500000,
    currency: "EGP",
    area: 240,
    bedrooms: 3,
    bathrooms: 3,
    floors: 2,
    ai_score: 9.1,
    ai_label: "Walkable District",
    delivery_year: 2025,
    tags: ["Street Retail", "Walkable", "Pool", "Concierge"],
    images: [
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=85",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=85",
    ],
    lat: 30.0190, lng: 31.4620,
    source: "sierra-curated",
  },
];

// ── Attempt live PropertyFinder feed, fall back to curated data ──────────────
async function fetchPFProperties(params: {
  purpose?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  page?: number;
  rows?: number;
}): Promise<typeof PROPERTIES> {
  const key    = process.env["PF_API_KEY"];
  const secret = process.env["PF_API_SECRET"];

  if (!key || !secret) return PROPERTIES;

  try {
    const qs = new URLSearchParams({
      key,
      secret,
      country: "eg",
      rows: String(params.rows ?? 12),
      page: String(params.page ?? 1),
      ...(params.purpose  ? { purpose: params.purpose  } : {}),
      ...(params.category ? { category_id: params.category } : {}),
    });

    const res = await fetch(
      `https://www.propertyfinder.eg/xmlfeed/index.php?${qs}`,
      { headers: { "Accept": "application/json" }, signal: AbortSignal.timeout(5000) }
    );

    if (!res.ok) throw new Error(`PF API ${res.status}`);
    return PROPERTIES; // parse real response here when feed is whitelisted
  } catch {
    return PROPERTIES;
  }
}

// ── /api/properties ──────────────────────────────────────────────────────────
router.get("/properties", async (req, res) => {
  const {
    purpose,
    category,
    compound,
    min_price,
    max_price,
    bedrooms,
    min_ai,
    page = "1",
    rows = "12",
    search,
  } = req.query as Record<string, string>;

  let data = await fetchPFProperties({
    purpose, category,
    min_price: min_price ? Number(min_price) : undefined,
    max_price: max_price ? Number(max_price) : undefined,
    bedrooms:  bedrooms  ? Number(bedrooms)  : undefined,
    page:      Number(page),
    rows:      Number(rows),
  });

  // Apply client-side filters on curated data
  if (purpose)   data = data.filter(p => p.purpose === purpose);
  if (category)  data = data.filter(p => p.category === category);
  if (compound)  data = data.filter(p => p.compound.toLowerCase().includes(compound.toLowerCase()));
  if (bedrooms)  data = data.filter(p => p.bedrooms >= Number(bedrooms));
  if (min_price) data = data.filter(p => p.price >= Number(min_price));
  if (max_price) data = data.filter(p => p.price <= Number(max_price));
  if (min_ai)    data = data.filter(p => p.ai_score >= Number(min_ai));
  if (search)    data = data.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.compound.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  // Sort by AI score desc
  data.sort((a, b) => b.ai_score - a.ai_score);

  const pageNum  = Number(page);
  const rowsNum  = Number(rows);
  const start    = (pageNum - 1) * rowsNum;
  const paginated = data.slice(start, start + rowsNum);

  res.json({
    total:   data.length,
    page:    pageNum,
    rows:    rowsNum,
    pages:   Math.ceil(data.length / rowsNum),
    results: paginated,
    source:  "sierra-curated",
    pf_status: "feed_pending_whitelist",
  });
});

// ── /api/properties/:id ──────────────────────────────────────────────────────
router.get("/properties/:id", (req, res) => {
  const prop = PROPERTIES.find(p => p.id === req.params.id);
  if (!prop) {
    res.status(404).json({ error: "Property not found" });
    return;
  }
  res.json(prop);
});

// ── /api/compounds ───────────────────────────────────────────────────────────
router.get("/compounds", (_req, res) => {
  const compounds = [...new Set(PROPERTIES.map(p => p.compound))].sort();
  res.json(compounds);
});

export default router;
