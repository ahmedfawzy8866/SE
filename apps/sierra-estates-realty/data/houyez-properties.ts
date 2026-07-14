/**
 * Houyez-Style Portal — data source
 * ────────────────────────────────────────────────────────────────────────────
 * Sample data for the Houyez-Style Portal embedded on /clients.
 *
 * Adapted from the Sierra Estates × Houyez design system bundle
 * (uploaded 2026-07-06 as "6-7 design.zip" → ui_kits/houyez-portal/).
 * The original is plain HTML + JS; here we re-shape it as typed TS data so
 * the portal can render server-side from a single source of truth.
 *
 * All fields are bilingual (en + ar). Images are Unsplash hot-links, matching
 * the upstream design bundle (no asset redistribution).
 */

export interface HouyezSlide {
  pre: string;
  preAr: string;
  main: string;
  mainAr: string;
  img: string;
}

export interface HouyezCompound {
  name: string;
  nameAr: string;
  zone: string;
  zoneAr: string;
  count: number;
  img: string;
}

export interface HouyezRoom {
  name: string;
  nameAr: string;
  sub: string;
  subAr: string;
  img: string;
}

export interface HouyezTour {
  id?: string;
  title: string;
  titleAr: string;
  subtitle?: string;
  subtitleAr?: string;
  /** Embed URL of the 3D tour (listing3d / matterport / kuula / etc.). */
  src: string;
  /** Poster image shown until the user clicks play. */
  poster?: string;
  /** Provider name. */
  provider?: 'listing3d' | 'matterport' | 'kuula' | '3dvista' | 'p3d' | 'other';
  /** Property reference code (links back to a HouyezListing.code if applicable). */
  propertyCode?: string;
  /** Address / location description. */
  address?: string;
  addressAr?: string;
  order: number;
  active: boolean;
}

export interface HouyezListing {
  id: number;
  code: string;
  cmp: string;
  cmpAr: string;
  zone: string;
  zoneAr: string;
  type: 'Villa' | 'Twin House' | 'Apartment' | 'Penthouse' | 'Duplex';
  typeAr: string;
  beds: number;
  bath: number;
  area: number;
  egpM: number; // price in millions EGP
  usd: number; // price in USD / mo
  ai: number; // AI match score 0-10
  tag: 'Premium' | 'Featured' | 'Smart Match' | 'Exclusive' | 'New' | 'Best ROI' | null;
  tagAr: string | null;
  mode: 'sale' | 'rent';
  modeAr: string;
  agent: string;
  agentAr: string;
  ago: string;
  agoAr: string;
  img: string;
}

export const HOUEZ_SLIDES: HouyezSlide[] = [
  {
    pre: 'FIRST & ONLY WEBSITE IN EGYPT DESIGNED FOR NEW CAIRO',
    preAr: 'الموقع الأول والوحيد في مصر المصمم للقاهرة الجديدة',
    main: 'The First Exclusive Destination for New Cairo Properties. Rent & Resale.',
    mainAr: 'الوجهة الحصرية الأولى لعقارات القاهرة الجديدة. إيجار وبيع.',
    img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=85',
  },
  {
    pre: 'BEST-IN-CLASS DESIGN',
    preAr: 'تصميم من الطراز الأول',
    main: 'Redefining Luxury Living with AI-Driven Excellence',
    mainAr: 'نعيد تعريف الفخامة بتميّز الذكاء الاصطناعي',
    img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1920&q=85',
  },
  {
    pre: 'AI-DRIVEN EXCELLENCE',
    preAr: 'تميّز بالذكاء الاصطناعي',
    main: 'Smart Matches for Smart Investors',
    mainAr: 'توافق ذكي لمستثمرين أذكياء',
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=85',
  },
  {
    pre: 'EXCLUSIVE NETWORK',
    preAr: 'شبكة حصرية',
    main: 'Unrivaled Access to Premium Compounds',
    mainAr: 'وصول لا يُضاهى لأرقى الكمبوندات',
    img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1920&q=85',
  },
  {
    pre: 'CURATED PORTFOLIO',
    preAr: 'محفظة منتقاة',
    main: 'Your Journey to Exceptional Homes Begins Here',
    mainAr: 'رحلتك نحو منزل استثنائي تبدأ هنا',
    img: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1920&q=85',
  },
];

export const HOUEZ_COMPOUNDS: HouyezCompound[] = [
  {
    name: 'Hyde Park',
    nameAr: 'هايد بارك',
    zone: '5th Settlement',
    zoneAr: 'التجمع الخامس',
    count: 142,
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=85',
  },
  {
    name: 'Mountain View iCity',
    nameAr: 'ماونتن فيو آي سيتي',
    zone: '5th Settlement',
    zoneAr: 'التجمع الخامس',
    count: 98,
    img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=85',
  },
  {
    name: 'Mivida',
    nameAr: 'ميفيدا',
    zone: '5th Settlement',
    zoneAr: 'التجمع الخامس',
    count: 76,
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=85',
  },
  {
    name: 'Uptown Cairo',
    nameAr: 'أبتاون القاهرة',
    zone: 'Mokattam',
    zoneAr: 'المقطم',
    count: 54,
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=85',
  },
];

export const HOUEZ_ROOMS: HouyezRoom[] = [
  {
    name: 'Luxury Living Room',
    nameAr: 'غرفة معيشة فاخرة',
    sub: 'Hyde Park · Grand Villa · 5th Settlement',
    subAr: 'هايد بارك · فيلا جراند · التجمع الخامس',
    img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1400&q=85',
  },
  {
    name: 'Master Bedroom Suite',
    nameAr: 'جناح غرفة النوم الرئيسية',
    sub: 'Mountain View iCity · Penthouse Level',
    subAr: 'ماونتن فيو آي سيتي · بنتهاوس',
    img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1400&q=85',
  },
  {
    name: 'Garden Courtyard',
    nameAr: 'فناء الحديقة',
    sub: 'Villette · Villa G-Type',
    subAr: 'فيليت · فيلا نوع G',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85',
  },
  {
    name: 'Infinity Pool & Deck',
    nameAr: 'مسبح إنفينيتي والسطح',
    sub: 'Taj City · Signature Villa',
    subAr: 'تاج سيتي · فيلا سيجنتشر',
    img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1400&q=85',
  },
  {
    name: 'Rooftop Sky Terrace',
    nameAr: 'تراس السطح السماوي',
    sub: 'Uptown Cairo · Penthouse Level',
    subAr: 'أبتاون القاهرة · بنتهاوس',
    img: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=1400&q=85',
  },
];

export const HOUEZ_LISTINGS: HouyezListing[] = [
  {
    id: 1, code: 'HP-VL-01', cmp: 'Hyde Park', cmpAr: 'هايد بارك',
    zone: '5th Settlement', zoneAr: 'التجمع الخامس',
    type: 'Villa', typeAr: 'فيلا',
    beds: 5, bath: 5, area: 480, egpM: 28.5, usd: 5200, ai: 9.8,
    tag: 'Premium', tagAr: 'مميز', mode: 'sale', modeAr: 'بيع',
    agent: 'Layla Mansour', agentAr: 'ليلى منصور',
    ago: '2d ago', agoAr: 'منذ يومين',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=85',
  },
  {
    id: 2, code: 'MVW-TH-02', cmp: 'Mountain View iCity', cmpAr: 'ماونتن فيو آي سيتي',
    zone: '5th Settlement', zoneAr: 'التجمع الخامس',
    type: 'Twin House', typeAr: 'توين هاوس',
    beds: 4, bath: 3, area: 280, egpM: 15.5, usd: 2400, ai: 9.6,
    tag: 'Featured', tagAr: 'مميز', mode: 'sale', modeAr: 'بيع',
    agent: 'Karim Fahmy', agentAr: 'كريم فهمي',
    ago: '5h ago', agoAr: 'منذ 5 ساعات',
    img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=85',
  },
  {
    id: 3, code: 'MV-AP-03', cmp: 'Mivida', cmpAr: 'ميفيدا',
    zone: '5th Settlement', zoneAr: 'التجمع الخامس',
    type: 'Apartment', typeAr: 'شقة',
    beds: 3, bath: 2, area: 145, egpM: 6.8, usd: 1650, ai: 9.1,
    tag: 'Smart Match', tagAr: 'توافق ذكي', mode: 'rent', modeAr: 'إيجار',
    agent: 'Nour Saleh', agentAr: 'نور صالح',
    ago: '1d ago', agoAr: 'منذ يوم',
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=85',
  },
  {
    id: 4, code: 'UPC-PH-04', cmp: 'Uptown Cairo', cmpAr: 'أبتاون القاهرة',
    zone: 'Mokattam', zoneAr: 'المقطم',
    type: 'Penthouse', typeAr: 'بنتهاوس',
    beds: 4, bath: 3, area: 300, egpM: 18.5, usd: 3800, ai: 9.5,
    tag: 'Exclusive', tagAr: 'حصري', mode: 'sale', modeAr: 'بيع',
    agent: 'Omar Magdy', agentAr: 'عمر مجدي',
    ago: '6h ago', agoAr: 'منذ 6 ساعات',
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=85',
  },
  {
    id: 5, code: 'TAJ-VL-05', cmp: 'Taj City', cmpAr: 'تاج سيتي',
    zone: 'New Cairo', zoneAr: 'القاهرة الجديدة',
    type: 'Villa', typeAr: 'فيلا',
    beds: 5, bath: 5, area: 500, egpM: 35.0, usd: 6500, ai: 9.5,
    tag: 'Premium', tagAr: 'مميز', mode: 'sale', modeAr: 'بيع',
    agent: 'Yara Hakim', agentAr: 'يارا حكيم',
    ago: '4d ago', agoAr: 'منذ 4 أيام',
    img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=85',
  },
  {
    id: 6, code: 'VLT-VL-06', cmp: 'Villette', cmpAr: 'فيليت',
    zone: '5th Settlement', zoneAr: 'التجمع الخامس',
    type: 'Villa', typeAr: 'فيلا',
    beds: 4, bath: 4, area: 390, egpM: 24.5, usd: 4400, ai: 9.3,
    tag: 'New', tagAr: 'جديد', mode: 'sale', modeAr: 'بيع',
    agent: 'Rana Adel', agentAr: 'رنا عادل',
    ago: '3d ago', agoAr: 'منذ 3 أيام',
    img: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=85',
  },
  {
    id: 7, code: 'PH-VL-07', cmp: 'Palm Hills NC', cmpAr: 'بالم هيلز',
    zone: '5th Settlement', zoneAr: 'التجمع الخامس',
    type: 'Villa', typeAr: 'فيلا',
    beds: 4, bath: 3, area: 380, egpM: 23.5, usd: 4200, ai: 9.2,
    tag: 'Best ROI', tagAr: 'أفضل عائد', mode: 'sale', modeAr: 'بيع',
    agent: 'Layla Mansour', agentAr: 'ليلى منصور',
    ago: '1w ago', agoAr: 'منذ أسبوع',
    img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=85',
  },
  {
    id: 8, code: 'EST-DX-08', cmp: 'Eastown', cmpAr: 'إيست تاون',
    zone: '5th Settlement', zoneAr: 'التجمع الخامس',
    type: 'Duplex', typeAr: 'دوبلكس',
    beds: 3, bath: 2, area: 220, egpM: 11.5, usd: 2400, ai: 9.1,
    tag: null, tagAr: null, mode: 'rent', modeAr: 'إيجار',
    agent: 'Karim Fahmy', agentAr: 'كريم فهمي',
    ago: '2d ago', agoAr: 'منذ يومين',
    img: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&q=85',
  },
];

// ─── Search-tab + filter options ─────────────────────────────────────────────
export const HOUEZ_SEARCH_TABS = [
  { id: 'buy', label: 'Buy', labelAr: 'شراء' },
  { id: 'rent', label: 'Rent', labelAr: 'إيجار' },
  { id: 'new', label: 'New Launches', labelAr: 'إطلاقات جديدة' },
] as const;

export const HOUEZ_TYPE_FILTERS = [
  { id: 'all', label: 'All', labelAr: 'الكل' },
  { id: 'Villa', label: 'Villa', labelAr: 'فيلا' },
  { id: 'Apartment', label: 'Apartment', labelAr: 'شقة' },
  { id: 'Town', label: 'Town / Twin', labelAr: 'توين هاوس' },
  { id: 'Pent', label: 'Penthouse / Duplex', labelAr: 'بنتهاوس / دوبلكس' },
] as const;

export const HOUEZ_MODE_FILTERS = [
  { id: 'all', label: 'All', labelAr: 'الكل' },
  { id: 'sale', label: 'For Sale', labelAr: 'للبيع' },
  { id: 'rent', label: 'For Rent', labelAr: 'للإيجار' },
] as const;

// ─── 3D Virtual Tours (seed data) ────────────────────────────────────────────
// Source: https://3dapartment.com/powder-house-square/108-central-street-3r-2143/177573
// Embed URL extracted from the page's <external-tour-viewer src="..."> tag.
// Provider: listing3d.com — tour renders via iframe embed.
export const HOUEZ_TOURS: HouyezTour[] = [
  {
    title: '108 Central Street #3R — Somerville, MA',
    titleAr: '108 سنترال ستريت #3R — سومرفيل، ماساتشوستس',
    subtitle: '4 Bed · 1 Bath · 1300 sqft · Powder House Square',
    subtitleAr: '4 غرف نوم · 1 حمام · 1300 قدم² · باودر هاوس سكوير',
    src: 'https://listing3d.com/embed/r39d0bd4dde0a4fe693c7fe5fd230a896',
    poster: 'https://3dapartment.com/spheres/listing_preview/listing_preview_89476a3cf015e27b51.80462088.jpg',
    provider: 'listing3d',
    propertyCode: 'EXT-SMR-001',
    address: '108 Central Street #3R, Somerville, MA 02143',
    addressAr: '108 سنترال ستريت #3R، سومرفيل، ماساتشوستس 02143',
    order: 0,
    active: true,
  },
];
