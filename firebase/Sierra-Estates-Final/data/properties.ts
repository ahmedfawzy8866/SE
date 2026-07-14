export interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  price: number;
  priceLabel: string;
  beds: number;
  baths: number;
  sqft: number;
  type: "villa" | "penthouse" | "estate" | "compound" | "beachfront";
  aiScore: number;
  yieldPercent: number;
  image: any;
  tags: string[];
  description: string;
  features: string[];
  compound: string;
  lat: number;
  lng: number;
  isFeatured: boolean;
  deliveryDate?: string;
  isOffPlan?: boolean;
  tourUrl?: string;
}

export const PROPERTIES: Property[] = [
  {
    id: "1",
    title: "The Uptown Villa",
    location: "Uptown Cairo",
    city: "Cairo",
    price: 8500000,
    priceLabel: "$8.5M",
    beds: 4,
    baths: 5,
    sqft: 6200,
    type: "villa",
    aiScore: 99,
    yieldPercent: 7.2,
    image: require("../assets/images/property2.png"),
    tags: ["AI Top Pick", "High Yield", "Panoramic Views"],
    description:
      "The Uptown Villa redefines ultra-luxury living with 360-degree city skyline views over Cairo, bespoke finishes, and a private rooftop terrace.",
    features: ["Private rooftop terrace", "Smart home automation", "Concierge service", "Private elevator", "Wine cellar", "Home theatre"],
    compound: "Uptown Cairo",
    lat: 30.019,
    lng: 31.312,
    isFeatured: true,
    isOffPlan: false,
    tourUrl: "https://momento360.com/e/uc/0f3c92e4e9484c8588b1cddee7b8ec54?utm_campaign=embed&utm_source=other",
  },
  {
    id: "2",
    title: "Alora Mivida Estate",
    location: "Mivida",
    city: "New Cairo",
    price: 15200000,
    priceLabel: "$15.2M",
    beds: 7,
    baths: 8,
    sqft: 12800,
    type: "estate",
    aiScore: 97,
    yieldPercent: 6.1,
    image: require("../assets/images/property1.png"),
    tags: ["Exclusive", "Private Pool", "Golf Course View"],
    description:
      "Alora Mivida Estate is a sprawling masterpiece set within one of New Cairo's most prestigious gated communities. Resort-style amenities and bespoke architecture offer unrivalled privacy.",
    features: ["Olympic-size pool", "Tennis court", "6-car garage", "Staff quarters", "Landscape gardens", "Home gym & spa"],
    compound: "Mivida",
    lat: 30.015,
    lng: 31.500,
    isFeatured: true,
    isOffPlan: false,
    tourUrl: "https://momento360.com/e/uc/0f3c92e4e9484c8588b1cddee7b8ec54?utm_campaign=embed&utm_source=other",
  },
  {
    id: "3",
    title: "Madinaty Lakes Compound",
    location: "Madinaty",
    city: "New Cairo",
    price: 22000000,
    priceLabel: "$22M",
    beds: 9,
    baths: 10,
    sqft: 18500,
    type: "compound",
    aiScore: 96,
    yieldPercent: 5.8,
    image: require("../assets/images/property3.png"),
    tags: ["Waterfront", "Compound", "Rare Find"],
    description:
      "A private waterfront compound in Madinaty featuring three interconnected villas, a private berth, and direct lake access.",
    features: ["Private lake access", "Boat berth", "Helipad", "Infinity pool", "Guest house", "Golf club membership"],
    compound: "Hyde Park",
    lat: 30.089,
    lng: 31.636,
    isFeatured: true,
    isOffPlan: false,
    tourUrl: "https://momento360.com/e/uc/0f3c92e4e9484c8588b1cddee7b8ec54?utm_campaign=embed&utm_source=other",
  },
  {
    id: "4",
    title: "Azure Hyde Park Residence",
    location: "Hyde Park",
    city: "New Cairo",
    price: 11500000,
    priceLabel: "$11.5M",
    beds: 5,
    baths: 6,
    sqft: 8900,
    type: "villa",
    aiScore: 94,
    yieldPercent: 6.8,
    image: require("../assets/images/property4.png"),
    tags: ["Park View", "Green Living", "High Yield"],
    description:
      "Azure offers an unmatched lifestyle moments from the central park. Direct park frontage, expansive terraces, and award-winning interiors.",
    features: ["Direct park access", "Wrap-around terrace", "Smart home systems", "Private pool", "Chef's kitchen", "Home office suite"],
    compound: "Hyde Park",
    lat: 29.985,
    lng: 31.515,
    isFeatured: false,
    isOffPlan: true,
    deliveryDate: "Q4 2027",
    tourUrl: "https://momento360.com/e/uc/0f3c92e4e9484c8588b1cddee7b8ec54?utm_campaign=embed&utm_source=other",
  },
  {
    id: "5",
    title: "The 5th Settlement Observatory",
    location: "5th Settlement",
    city: "New Cairo",
    price: 6800000,
    priceLabel: "$6.8M",
    beds: 3,
    baths: 4,
    sqft: 4100,
    type: "penthouse",
    aiScore: 93,
    yieldPercent: 7.8,
    image: require("../assets/images/property2.png"),
    tags: ["City View", "High Yield", "Central"],
    description:
      "The Observatory commands unobstructed views of New Cairo. Investment-grade with consistent short-term rental premiums.",
    features: ["City views", "Open plan living", "Floor-to-ceiling glass", "Lounge terrace", "Maid's room", "Parking x2"],
    compound: "Al Rehab",
    lat: 30.016,
    lng: 31.439,
    isFeatured: false,
    isOffPlan: true,
    deliveryDate: "Q2 2028",
    tourUrl: "https://momento360.com/e/uc/0f3c92e4e9484c8588b1cddee7b8ec54?utm_campaign=embed&utm_source=other",
  },
  {
    id: "6",
    title: "Al Rehab Garden Estate",
    location: "Al Rehab",
    city: "New Cairo",
    price: 18700000,
    priceLabel: "$18.7M",
    beds: 8,
    baths: 9,
    sqft: 15300,
    type: "estate",
    aiScore: 91,
    yieldPercent: 5.2,
    image: require("../assets/images/property1.png"),
    tags: ["Nature", "Rare", "Ultra Private"],
    description:
      "Set within one of New Cairo's most established communities, Al Rehab Garden Estate offers extraordinary seclusion surrounded by natural landscape.",
    features: ["Botanical reserve views", "Private walkways", "Meditation pavilion", "Organic farm plot", "Zero-energy design", "Art studio"],
    compound: "Al Rehab",
    lat: 30.063,
    lng: 31.492,
    isFeatured: false,
    isOffPlan: false,
    tourUrl: "https://momento360.com/e/uc/0f3c92e4e9484c8588b1cddee7b8ec54?utm_campaign=embed&utm_source=other",
  },
];

export const STATS = [
  { value: "1,500+", label: "Luxury Listings" },
  { value: "98%", label: "AI Match Rate" },
  { value: "26", label: "Compounds" },
  { value: "<4s", label: "Response Time" },
];

export const FEATURES = [
  {
    icon: "cpu",
    title: "AI-Powered Matching",
    description: "Our engine evaluates 40+ data points per property to surface only your highest-fit opportunities.",
  },
  {
    icon: "trending-up",
    title: "Yield Intelligence",
    description: "Real-time market analytics forecast rental yield and capital appreciation for every listing.",
  },
  {
    icon: "shield",
    title: "Verified Listings",
    description: "Every property is physically inspected and legally verified before it reaches the platform.",
  },
  {
    icon: "zap",
    title: "Instant Connect",
    description: "Connect with a dedicated advisor in under 4 seconds. No bots, no waiting rooms.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Sheikh Hamdan Al-R.",
    role: "Portfolio Investor",
    avatar: "SH",
    rating: 5,
    text: "Sierra Estates found me a compound in Emirates Hills I never would have discovered myself. The AI score was spot-on — it's returned 7.4% yield in year one.",
  },
  {
    name: "Victoria Ashworth",
    role: "HNW Family Office",
    avatar: "VA",
    rating: 5,
    text: "The virtual tours saved us three international trips. We purchased remotely with full confidence. Exceptional service and a genuinely intelligent platform.",
  },
  {
    name: "James R. Caldwell",
    role: "Private Equity, London",
    avatar: "JC",
    rating: 5,
    text: "I've used every major platform. Nothing comes close to the depth of yield data and the speed of advisor response. This is the future of real estate.",
  },
];
