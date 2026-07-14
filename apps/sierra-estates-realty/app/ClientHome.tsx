'use client';

/* ============================================================================
   SIERRA ESTATES — CLIENT HOMEPAGE
   Production React component tree (no iframe, no Babel-in-browser).
   Ports the "Mobile v23-7" web-app prototype's design/structure to real
   React + framer-motion + Firestore + the unified design tokens.
   Reference: design-system/ui_kits/web-app/{sections,core}.jsx and
   design-system/components/property/PropertyCard.jsx
   ============================================================================ */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db as clientDb } from '@/lib/firebase';
import { useI18n } from '@/lib/I18nContext';
import { SiteConfig } from '@/lib/config';
import { COMPOUNDS } from './client/portalData';
import type { MapPoint } from '@/components/Maps/LiveMap';
import './client-home.css';

// Leaflet map — SSR-safe, client-only (reuses the existing vanilla-Leaflet map)
const LiveMap = dynamic<{
  mode?: 'dark' | 'light';
  points?: MapPoint[];
  labels?: { yield: string; price: string; ai: string; demand: string };
}>(() => import('@/components/Maps/LiveMap'), { ssr: false });

// Interactive panorama — SSR-safe (uses pointer events + clipboard).
const PanoViewer = dynamic<import('@/components/Panorama/PanoViewer').PanoViewerProps>(
  () => import('@/components/Panorama/PanoViewer'),
  { ssr: false },
);

// Immersive-tour panorama plate. Swap for a true equirectangular 360° asset when
// available; any wide, high-resolution shot pans well in the meantime.
const PANO_SRC = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2400&q=85';

const WHATSAPP = SiteConfig.contact.whatsapp;

/* ── Types ─────────────────────────────────────────────────────────────── */
interface Listing {
  id: string | number;
  title: string;
  location: string;
  code: string;
  type: string;
  beds: number;
  baths: number;
  area: number;
  priceLabel: string;
  aiScore: number;
  img: string;
  badge?: string | null;
  badgeColor?: string;
}

/* ── Fallback listings (New Cairo compounds) for empty/unconfigured dev ──── */
const FALLBACK: Listing[] = [
  { id: 1, title: 'Grand Villa', location: 'Hyde Park · New Cairo', code: 'HP-VL-04', type: 'Villa', beds: 5, baths: 5, area: 480, priceLabel: 'EGP 28.5M', aiScore: 96, badge: 'Premium', badgeColor: '#C8961A', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=85' },
  { id: 2, title: 'Twin House', location: 'Mountain View iCity', code: 'MV-TH-02', type: 'Twin House', beds: 4, baths: 3, area: 280, priceLabel: 'EGP 15.5M', aiScore: 92, badge: 'Featured', badgeColor: '#1E88D9', img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=85' },
  { id: 3, title: 'Garden Apartment', location: 'Mivida · Emaar', code: 'MVD-AP-11', type: 'Apartment', beds: 3, baths: 2, area: 145, priceLabel: 'EGP 6.8M', aiScore: 88, badge: null, img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=85' },
  { id: 4, title: 'Sky Penthouse', location: 'Uptown Cairo', code: 'UPT-PH-01', type: 'Penthouse', beds: 4, baths: 3, area: 300, priceLabel: 'EGP 18.5M', aiScore: 94, badge: 'Exclusive', badgeColor: '#7C3AED', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=85' },
  { id: 5, title: 'Signature Villa', location: 'Taj City', code: 'TJC-VL-07', type: 'Villa', beds: 5, baths: 5, area: 500, priceLabel: 'EGP 35.0M', aiScore: 98, badge: 'Premium', badgeColor: '#C8961A', img: 'https://images.unsplash.com/photo-1613977257592-4a9a32f9141a?w=900&q=85' },
  { id: 6, title: 'Corner Villa', location: 'Villette · SODIC', code: 'VLT-VL-03', type: 'Villa', beds: 4, baths: 4, area: 390, priceLabel: 'EGP 24.5M', aiScore: 90, badge: 'New', badgeColor: '#34D399', img: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=900&q=85' },
];

/* ── Bilingual copy ────────────────────────────────────────────────────── */
const COPY = {
  en: {
    navListings: 'Listings', navMap: 'Map', navContact: 'Contact', navCta: 'Request a Property',
    eyebrow: 'AI-DRIVEN · NEW CAIRO',
    h1a: 'Find Your', h1b: 'Dream Home', h1c: 'in New Cairo.',
    sub: '19 compounds · 1,200+ verified units · AI-curated matches, human-closed deals.',
    ctaBrowse: 'Browse Listings', ctaWhatsapp: 'WhatsApp Us',
    s1: 'Verified Units', s2: 'Compounds', s3: 'Match Accuracy', s4: 'Avg. Response',
    featEyebrow: 'AI-CURATED INVENTORY', featTitle: 'Featured Properties', featTitleItalic: 'Properties', viewAll: 'View All →',
    mapEyebrow: 'LIVE MARKET MAP', mapTitle: 'Where the Signals Are', mapSub: 'Real-time demand and yield across New Cairo compounds.',
    mapLegend: 'Marker size = live demand · colour = expected yield',
    mapYield: 'Yield', mapPrice: 'Avg', mapAi: 'AI', mapDemand: 'live',
    tourEyebrow: 'IMMERSIVE TOURS', tourTitle: 'Step Inside, From Anywhere',
    tourSub: 'Drag to explore our flagship residences in an interactive 360° panorama — then share the tour with a single link.',
    tourBadge: '360° TOUR', tourHint: 'Drag to explore', tourCopy: 'Copy tour link', tourCopied: 'Link copied',
    whyEyebrow: 'OUR ADVANTAGE', whyTitle: 'Why Sierra Estates', whyTitleItalic: 'Sierra Estates',
    w1t: 'AI Opportunity Scanner', w1s: 'Our engine scans 1,200+ units daily — ROI, AVM pricing and smart matching surface the best deals first.',
    w2t: 'Verified Inventory', w2s: 'Every listing is personally verified on-site before it reaches your feed. No ghosts, no bait.',
    w3t: 'Human + AI Closing', w3s: 'AI-sourced opportunities paired with expert advisors — first match to signed contract in as little as 48 hours.',
    bandTitle: 'Ready to find your place?', bandSub: 'Tell us what you are looking for — our team replies within 4 hours.',
    bandCta: 'Start on WhatsApp',
    footer: '© Sierra Estates · New Cairo, Egypt', footerSub: 'Future of Real Estate',
  },
  ar: {
    navListings: 'العقارات', navMap: 'الخريطة', navContact: 'تواصل', navCta: 'اطلب عقارك',
    eyebrow: 'ذكاء اصطناعي · القاهرة الجديدة',
    h1a: 'اعثر على', h1b: 'منزل أحلامك', h1c: 'في القاهرة الجديدة.',
    sub: '19 كمبوند · +1200 وحدة موثقة · ترشيحات بالذكاء الاصطناعي وإتمام بخبرة بشرية.',
    ctaBrowse: 'تصفح العقارات', ctaWhatsapp: 'راسلنا واتساب',
    s1: 'وحدة موثقة', s2: 'كمبوند', s3: 'دقة التوافق', s4: 'متوسط الرد',
    featEyebrow: 'مخزون منتقى بالذكاء', featTitle: 'عقارات مميزة', featTitleItalic: '', viewAll: '← عرض الكل',
    mapEyebrow: 'خريطة السوق الحية', mapTitle: 'أين تتحرك الإشارات', mapSub: 'الطلب والعائد لحظياً عبر كمبوندات القاهرة الجديدة.',
    mapLegend: 'حجم النقطة = الطلب الحي · اللون = العائد المتوقع',
    mapYield: 'العائد', mapPrice: 'متوسط', mapAi: 'ذكاء', mapDemand: 'وحدة',
    tourEyebrow: 'جولات غامرة', tourTitle: 'ادخل من أي مكان',
    tourSub: 'اسحب لاستكشاف أرقى وحداتنا بزاوية 360° تفاعلية — ثم شارك الجولة برابط واحد.',
    tourBadge: 'جولة 360°', tourHint: 'اسحب للاستكشاف', tourCopy: 'انسخ رابط الجولة', tourCopied: 'تم نسخ الرابط',
    whyEyebrow: 'مزايانا', whyTitle: 'لماذا سيرا إستيتس', whyTitleItalic: '',
    w1t: 'ماسح الفرص الذكي', w1s: 'محركنا يفحص +1200 وحدة يومياً — العائد والتسعير والتوافق الذكي لإيجاد أفضل الفرص أولاً.',
    w2t: 'مخزون موثق', w2s: 'كل وحدة يتم التحقق منها ميدانياً قبل ظهورها. لا وحدات وهمية.',
    w3t: 'إغلاق بشري + ذكاء', w3s: 'فرص يكتشفها الذكاء الاصطناعي مع مستشارين خبراء — من التوافق حتى التوقيع خلال 48 ساعة.',
    bandTitle: 'جاهز تلاقي مكانك؟', bandSub: 'قولنا بتدور على إيه — فريقنا يرد خلال 4 ساعات.',
    bandCta: 'ابدأ على واتساب',
    footer: '© سيرا إستيتس · القاهرة الجديدة، مصر', footerSub: 'مستقبل العقارات',
  },
};

/* ── Shield logo (brand emblem) ────────────────────────────────────────── */
function ShieldLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.08} viewBox="0 0 40 44" fill="none" aria-hidden>
      <defs>
        <linearGradient id="ch-shield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--gold-lt)" />
          <stop offset="1" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      <path d="M20 2L37 10.5V27Q37 39 20 43Q3 39 3 27V10.5Z" fill="var(--bg)" stroke="url(#ch-shield)" strokeWidth="2.4" />
      <rect x="12.5" y="17" width="3.6" height="11" rx=".7" fill="url(#ch-shield)" />
      <rect x="18.2" y="13" width="3.6" height="15" rx=".7" fill="url(#ch-shield)" />
      <rect x="23.9" y="19" width="3.6" height="9" rx=".7" fill="url(#ch-shield)" opacity=".7" />
    </svg>
  );
}

/* ── Small spec icon ───────────────────────────────────────────────────── */
const SPEC_ICONS: Record<string, string> = {
  bed: 'M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9',
  bath: 'M10 4 8 6M17 19v2M2 12h20M7 19v2M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5',
  area: 'M4 4h16v16H4z',
  heart: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
};
function SpecIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15, color: 'var(--tx-f)' }}>
      <path d={d} />
    </svg>
  );
}

/* ── Property card (ports design-system PropertyCard.jsx to the tokens) ─── */
function PropertyCard({ item, isAr: _isAr }: { item: Listing; isAr: boolean }) {
  const [saved, setSaved] = useState(false);
  // Firestore docs have string ids and a real detail view; fallback items go to the index.
  const href = typeof item.id === 'string' ? `/?view=property&id=${item.id}` : '/?view=properties';
  return (
    <Link href={href} className="se-pcard" style={{ textDecoration: 'none' }}>
      <div className="se-pcard__media">
        <img className="se-pcard__img" src={item.img} alt={item.title} loading="lazy" />
        <div className="se-pcard__scrim" />
        <span className="se-pcard__code">{item.code}</span>
        {item.badge && <span className="se-pcard__badge" style={{ background: item.badgeColor || 'var(--gold)' }}>{item.badge}</span>}
        <span className="se-pcard__ai"><span className="live-dot" /> AI {item.aiScore}</span>
        <button type="button" className={saved ? 'se-pcard__save se-pcard__save--on' : 'se-pcard__save'}
          aria-label={saved ? 'Saved' : 'Save'} aria-pressed={saved}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSaved((s) => !s); }}>
          <svg viewBox="0 0 24 24" fill={saved ? 'var(--red)' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
            <path d={SPEC_ICONS.heart} />
          </svg>
        </button>
      </div>
      <div className="se-pcard__body">
        <span className="se-pcard__loc">{item.location}</span>
        <h3 className="se-pcard__title">{item.title}</h3>
        <span className="se-pcard__price">{item.priceLabel}</span>
        <div className="se-pcard__specs">
          <span className="se-pcard__spec"><SpecIcon d={SPEC_ICONS.bed} />{item.beds}</span>
          <span className="se-pcard__spec"><SpecIcon d={SPEC_ICONS.bath} />{item.baths}</span>
          <span className="se-pcard__spec"><SpecIcon d={SPEC_ICONS.area} />{item.area} m²</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Section entrance (opacity always 1 — only translateY eases) ───────── */
function Reveal({ children, delay = 0, reduce }: { children: React.ReactNode; delay?: number; reduce: boolean }) {
  if (reduce) return <div>{children}</div>;
  return (
    <motion.div
      initial={{ transform: 'translateY(18px)' }}
      whileInView={{ transform: 'translateY(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ── Main homepage ─────────────────────────────────────────────────────── */
export default function ClientHome() {
  const { locale, setLocale } = useI18n();
  const isAr = locale === 'ar';
  const t = COPY[isAr ? 'ar' : 'en'];
  const reduce = !!useReducedMotion();
  const [listings, setListings] = useState<Listing[]>(FALLBACK);
  const [menuOpen, setMenuOpen] = useState(false);

  // Real Firestore data (falls back to hardcoded set when empty/unconfigured)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Public catalog reads must be status-gated to satisfy the Firestore
        // rules (`properties` allows public read only when status == 'published').
        const snap = await getDocs(
          query(collection(clientDb, 'properties'), where('status', '==', 'published'), limit(6)),
        );
        if (cancelled || snap.empty) return;
        const items: Listing[] = snap.docs.map((d, i) => {
          const p = d.data() as Record<string, any>;
          const priceM = typeof p.price === 'number' ? p.price / 1e6 : null;
          return {
            id: d.id,
            title: p.title || p.type || 'Residence',
            location: p.compound || p.location || 'New Cairo',
            code: p.sbrCode || p.code || `SBR-${String(i + 1).padStart(2, '0')}`,
            type: p.propertyType || p.type || 'Villa',
            beds: p.bedrooms ?? p.beds ?? 3,
            baths: p.bathrooms ?? p.baths ?? 2,
            area: p.area ?? 200,
            priceLabel: p.priceLabel || (priceM != null ? `EGP ${priceM.toFixed(1)}M` : 'On Request'),
            aiScore: p.aiScore ?? 90,
            img: p.featuredImage || p.img || FALLBACK[i % FALLBACK.length].img,
            badge: p.badge ?? p.tag ?? null,
            badgeColor: p.badgeColor || '#C8961A',
          };
        });
        setListings(items);
      } catch {
        /* keep fallback — Firestore may be unconfigured in local dev */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const enter = reduce ? {} : { initial: { transform: 'translateY(20px)' }, animate: { transform: 'translateY(0px)' } };

  // Intelligence-map markers: real New Cairo compounds (coords + yield + AI),
  // with a live demand signal = count of currently-loaded listings per compound.
  const mapPoints: MapPoint[] = useMemo(() => {
    const norm = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    return COMPOUNDS.map((c) => {
      const key = norm(c.n.split(' (')[0]).split(' ').slice(0, 2).join(' ');
      const demand = listings.reduce((n, l) => (norm(l.location).includes(key) ? n + 1 : n), 0);
      return {
        name: c.n,
        coord: c.c,
        yieldPct: parseInt(String(c.g).replace(/[^0-9-]/g, ''), 10) || 0,
        priceM: c.priceM,
        ai: c.ai,
        demand: demand > 0 ? demand : undefined,
      };
    });
  }, [listings]);

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className={isAr ? 'sb-ar' : ''} style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--nav)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--bd)' }}>
        <nav style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '14px var(--gutter)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'var(--tx)' }}>
            <ShieldLogo size={34} />
            <span>
              <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600, letterSpacing: '.02em', color: 'var(--tx-s)' }}>SIERRA ESTATES</span>
              <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '.28em', color: 'var(--gold)', textTransform: 'uppercase' }}>{t.footerSub}</span>
            </span>
          </Link>
          <div className="nav-right">
            <div className="nav-links">
              <Link href="/?view=properties" className="nav-link">{t.navListings}</Link>
              <a href="#map" className="nav-link">{t.navMap}</a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="nav-link">{t.navContact}</a>
            </div>
            <button onClick={() => setLocale(isAr ? 'en' : 'ar')} aria-label={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
              style={{ background: 'var(--surf)', border: '1px solid var(--bd-gold)', color: 'var(--gold-lt)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              {isAr ? 'EN' : 'عربي'}
            </button>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-gold nav-cta">{t.navCta}</a>
            <button type="button" className="nav-burger" aria-label={isAr ? 'القائمة' : 'Menu'} aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 20, height: 20 }}>
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div className="nav-mobile">
            <Link href="/?view=properties" className="nav-link" onClick={() => setMenuOpen(false)}>{t.navListings}</Link>
            <a href="#map" className="nav-link" onClick={() => setMenuOpen(false)}>{t.navMap}</a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="nav-link" onClick={() => setMenuOpen(false)}>{t.navContact}</a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-gold" onClick={() => setMenuOpen(false)}>{t.navCta}</a>
          </div>
        )}
      </header>

      <main>
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.2 }} />
        {/* gold grid + red radial (signature hero animation) */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--bd-gold) 1px, transparent 1px), linear-gradient(90deg, var(--bd-gold) 1px, transparent 1px)', backgroundSize: '54px 54px', opacity: 0.25, maskImage: 'radial-gradient(ellipse at 50% 30%, #000, transparent 72%)' }} />
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 78% 18%, rgba(230,57,70,.16), transparent 45%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 0%, var(--bg) 94%)' }} />
        <div style={{ position: 'relative', maxWidth: 'var(--container)', margin: '0 auto', padding: 'clamp(72px,10vw,130px) var(--gutter) 70px', textAlign: 'center' }}>
          <motion.div {...enter} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <div className="sb-eyebrow" style={{ justifyContent: 'center', marginBottom: 22 }}>{t.eyebrow}</div>
            <h1 className="sb-display" style={{ margin: 0 }}>
              {t.h1a} <span className="gold-text">{t.h1b}</span><br />{t.h1c}
            </h1>
            <p className="sb-body-lg" style={{ maxWidth: 580, margin: '26px auto 38px', color: 'var(--tx-m)' }}>{t.sub}</p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/?view=properties" className="btn-gold btn-lg">{t.ctaBrowse}</Link>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-wa btn-lg">{t.ctaWhatsapp}</a>
            </div>
          </motion.div>

          {/* STATS */}
          <Reveal reduce={reduce} delay={0.15}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1, maxWidth: 780, margin: '64px auto 0', background: 'var(--bd-gold)', border: '1px solid var(--bd-gold)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {[['1,200+', t.s1], ['19', t.s2], ['94%', t.s3], ['4h', t.s4]].map(([v, l]) => (
                <div key={l} style={{ background: 'var(--bg-e)', padding: '24px 12px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 28, color: 'var(--gold-lt)' }}>{v}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', color: 'var(--tx-m)', textTransform: 'uppercase', marginTop: 6 }}>{l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section id="listings" style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--section-pad) var(--gutter)' }}>
        <Reveal reduce={reduce}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 34 }}>
            <div>
              <div className="sb-eyebrow" style={{ marginBottom: 12 }}>{t.featEyebrow}</div>
              <h2 className="sb-display-l" style={{ margin: 0 }}>{isAr ? t.featTitle : <>Featured <span className="gold-static">Properties</span></>}</h2>
            </div>
            <Link href="/?view=properties" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--gold-lt)' }}>{t.viewAll}</Link>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 22 }}>
          {listings.map((item, i) => (
            <Reveal key={item.id} reduce={reduce} delay={Math.min(i * 0.06, 0.3)}>
              <PropertyCard item={item} isAr={isAr} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* LIVE MAP */}
      <section id="map" style={{ background: 'var(--bg-d)', borderTop: '1px solid var(--bd)', borderBottom: '1px solid var(--bd)' }}>
        <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--section-pad) var(--gutter)' }}>
          <Reveal reduce={reduce}>
            <div className="sb-eyebrow" style={{ marginBottom: 12 }}>{t.mapEyebrow}</div>
            <h2 className="sb-display-l" style={{ margin: '0 0 8px' }}>{t.mapTitle}</h2>
            <p className="sb-body" style={{ color: 'var(--tx-m)', margin: '0 0 28px' }}>{t.mapSub}</p>
          </Reveal>
          <Reveal reduce={reduce} delay={0.1}>
            <div style={{ height: 440, borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--bd-gold)', background: 'var(--bg-e2)' }}>
              <LiveMap
                mode="dark"
                points={mapPoints}
                labels={{ yield: t.mapYield, price: t.mapPrice, ai: t.mapAi, demand: t.mapDemand }}
              />
            </div>
            <p className="sb-body" style={{ color: 'var(--tx-f)', fontSize: 13, margin: '12px 0 0' }}>{t.mapLegend}</p>
          </Reveal>
        </div>
      </section>

      {/* IMMERSIVE TOUR — interactive panorama + shareable link */}
      <section id="tours" style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--section-pad) var(--gutter)' }}>
        <Reveal reduce={reduce}>
          <div className="sb-eyebrow" style={{ marginBottom: 12 }}>{t.tourEyebrow}</div>
          <h2 className="sb-display-l" style={{ margin: '0 0 8px' }}>{t.tourTitle}</h2>
          <p className="sb-body" style={{ color: 'var(--tx-m)', margin: '0 0 28px', maxWidth: 640 }}>{t.tourSub}</p>
        </Reveal>
        <Reveal reduce={reduce} delay={0.1}>
          <PanoViewer
            src={PANO_SRC}
            alt={t.tourTitle}
            shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/?view=tour` : '/?view=tour'}
            labels={{ badge: t.tourBadge, hint: t.tourHint, copy: t.tourCopy, copied: t.tourCopied }}
          />
        </Reveal>
      </section>

      {/* WHY SIERRA */}
      <section style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--section-pad) var(--gutter)' }}>
        <Reveal reduce={reduce}>
          <div className="sb-eyebrow" style={{ marginBottom: 12 }}>{t.whyEyebrow}</div>
          <h2 className="sb-display-l" style={{ margin: '0 0 40px' }}>{isAr ? t.whyTitle : <>Why <span className="gold-static">Sierra Estates</span></>}</h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 22 }}>
          {[['🛰️', t.w1t, t.w1s], ['✅', t.w2t, t.w2s], ['🤝', t.w3t, t.w3s]].map(([ic, tt, ss], i) => (
            <Reveal key={tt} reduce={reduce} delay={Math.min(i * 0.08, 0.24)}>
              <div className="lift" style={{ background: 'var(--bg-e)', border: '1px solid var(--bd)', borderRadius: 'var(--radius-lg)', padding: '30px 28px', height: '100%' }}>
                <div style={{ fontSize: 30, marginBottom: 16 }}>{ic}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: 'var(--tx-s)', marginBottom: 10 }}>{tt}</div>
                <p className="sb-body-sm" style={{ margin: 0, lineHeight: 1.7 }}>{ss}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--section-pad) var(--gutter)', textAlign: 'center' }}>
        <Reveal reduce={reduce}>
          <h2 className="sb-display-l" style={{ margin: '0 0 14px' }}>{t.bandTitle}</h2>
          <p className="sb-body" style={{ color: 'var(--tx-m)', margin: '0 0 30px' }}>{t.bandSub}</p>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-wa btn-lg" style={{ display: 'inline-flex' }}>💬 {t.bandCta}</a>
        </Reveal>
      </section>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--bd)', padding: '26px var(--gutter)', textAlign: 'center' }}>
        <div className="sb-caption">{t.footer}</div>
      </footer>

    </div>
  );
}
