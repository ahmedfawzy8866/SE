'use client';

/**
 * Houyez-Style Portal — client-facing marketplace surface for Sierra Estates.
 * ────────────────────────────────────────────────────────────────────────────
 * Adapted from the Sierra Estates × Houyez design bundle (design/ui_kits/houyez-portal/
 * in this repo). Reimplemented in React (Next.js App Router).
 *
 * The portal is fully dynamic:
 *   - All data fetched live from Firestore via the useHouyezPortal() hook
 *   - Real-time updates — admin edits appear instantly, no redeploy
 *   - Falls back to static seed (data/houyez-properties.ts) when Firebase isn't
 *     configured or collections are empty
 *
 * Sections:
 *   1. Hero slider (auto-advances every 6s, manual dots, EN/AR)
 *   2. Search card with Buy/Rent/New Launches tabs
 *   3. Compounds preview grid
 *   4. 360° virtual-tour rooms strip (horizontal snap-scroll)
 *   5. AI-curated listings grid with type + mode filters
 *   6. Stats strip (4 KPIs — computed live from the listings collection)
 *   7. 3D Virtual Tour (inline iframe player — listing3d.com embed)
 *   8. CTA strip (WhatsApp)
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  MapPin, Search, SlidersHorizontal, ChevronDown, Map as MapIcon,
  BedDouble, Bath, Maximize, Sparkles, Compass, Building2, BadgeCheck,
  Clock, ArrowRight, AlertCircle,
} from 'lucide-react';
import { useHouyezPortal } from '@/lib/houyez/useHouyezPortal';
import {
  HOUEZ_SLIDES, HOUEZ_SEARCH_TABS, HOUEZ_TYPE_FILTERS, HOUEZ_MODE_FILTERS,
  type HouyezListing,
} from '@/data/houyez-properties';
import VirtualTourViewer from '@/components/virtual-tour/VirtualTourViewer';
import './houyez-portal.css';

const HERO_INTERVAL_MS = 6000;

export default function HouyezPortal() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';

  // ── Dynamic data (Firestore, real-time) ───────────────────────────────────
  const { slides, compounds, rooms, listings, tours, usingSeed } = useHouyezPortal();

  // ── Hero slider ──────────────────────────────────────────────────────────
  const [slideIdx, setSlideIdx] = useState(0);
  useEffect(() => {
    if (slides.length === 0) return;
    if (slideIdx >= slides.length) setSlideIdx(0);
  }, [slides.length, slideIdx]);
  const advanceSlide = useCallback(() => {
    setSlideIdx((i) => (i + 1) % Math.max(slides.length, 1));
  }, [slides.length]);
  useEffect(() => {
    if (slides.length <= 1) return;
    if (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(advanceSlide, HERO_INTERVAL_MS);
    return () => clearInterval(t);
  }, [advanceSlide, slides.length]);

  // ── Search tabs ──────────────────────────────────────────────────────────
  const [searchTab, setSearchTab] = useState<typeof HOUEZ_SEARCH_TABS[number]['id']>('buy');

  // ── Listings filters ─────────────────────────────────────────────────────
  const [fType, setFType] = useState<string>('all');
  const [fMode, setFMode] = useState<string>('all');

  const matchType = useCallback((p: HouyezListing) => {
    if (fType === 'all') return true;
    if (fType === 'Town') return p.type === 'Twin House';
    if (fType === 'Pent') return p.type === 'Penthouse' || p.type === 'Duplex';
    return p.type === fType;
  }, [fType]);

  const filteredListings = useMemo(() => {
    return listings
      .filter((p) => matchType(p) && (fMode === 'all' || p.mode === fMode))
      .sort((a, b) => b.ai - a.ai);
  }, [listings, matchType, fMode]);

  // ── Live stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = listings.length;
    const avgAi = total > 0 ? listings.reduce((s, l) => s + (l.ai || 0), 0) / total : 0;
    return { total, avgAi: avgAi.toFixed(1) };
  }, [listings]);

  const slide = slides[slideIdx] ?? slides[0] ?? HOUEZ_SLIDES[0];

  const fmtPrice = (p: HouyezListing) =>
    p.mode === 'sale'
      ? `${p.egpM}M EGP · $${(p.usd / 1000).toFixed(1)}K`
      : `${p.usd.toLocaleString()} /mo`;

  const tagClass = (tag: HouyezListing['tag']) => {
    if (!tag) return '';
    return tag.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <section
      className="houyez-portal"
      dir={isAr ? 'rtl' : 'ltr'}
      data-using-seed={usingSeed ? '1' : undefined}
    >
      {usingSeed && (
        <div
          style={{
            background: '#fff4e6',
            color: '#c2410c',
            fontFamily: 'var(--hz-mono)',
            fontSize: 11,
            padding: '6px 16px',
            textAlign: 'center',
            letterSpacing: '0.04em',
          }}
        >
          <AlertCircle size={11} style={{ verticalAlign: -1, marginRight: 6 }} />
          {isAr
            ? 'البيانات تجريبية — قم بتشغيل POST /api/houyez/seed لتعبئة Firestore'
            : 'Demo data — POST /api/houyez/seed to populate Firestore'}
        </div>
      )}

      {/* ─── 1. Hero slider ─────────────────────────────────────────────── */}
      <div className="hz-hero" data-screen-label="Houyez hero">
        {slides.map((s, i) => (
          <div
            key={(s as any).id ?? i}
            className={`hz-hero-slide${i === slideIdx ? ' on' : ''}`}
            aria-hidden={i !== slideIdx}
          >
            <img src={s.img} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
          </div>
        ))}
        <div className="hz-hero-scrim" />
        <div className="hz-wrap hz-hero-inner">
          <div className="hz-eyebrow">{isAr ? slide.preAr : slide.pre}</div>
          <h1>
            {(() => {
              const txt = isAr ? slide.mainAr : slide.main;
              const parts = txt.split(/[,.](?=\s|$)/);
              if (parts.length < 2) return txt;
              return (
                <>
                  {parts[0]}.
                  <br />
                  <span className="hl">{parts.slice(1).join('.').trim()}</span>
                </>
              );
            })()}
          </h1>
          <p className="hz-sub">
            {isAr
              ? 'استكشف عقارات القاهرة الجديدة الفاخرة بمساعدة الذكاء الاصطناعي.'
              : 'Discover AI-curated luxury properties in New Cairo — rent, resale, and exclusive off-plan.'}
          </p>
          <div className="hz-quick">
            <span><BadgeCheck className="i" size={16} /> {isAr ? 'عقارات موثقة' : 'Verified Listings'}</span>
            <span><Sparkles className="i" size={16} /> {isAr ? 'توافق ذكي' : 'AI Smart Match'}</span>
            <span><Compass className="i" size={16} /> {isAr ? 'كمبوندات حصرية' : 'Premium Compounds'}</span>
          </div>
        </div>

        <div className="hz-dots" role="tablist" aria-label="hero slides">
          {slides.map((s, i) => (
            <button
              key={(s as any).id ?? i}
              role="tab"
              aria-selected={i === slideIdx}
              aria-label={`slide ${i + 1}`}
              className={i === slideIdx ? 'on' : ''}
              onClick={() => setSlideIdx(i)}
            />
          ))}
        </div>

        <a className="hz-map-cta" href="#houyez-listings">
          <span className="mc-ic"><MapIcon className="i" /></span>
          {isAr ? 'استكشف عبر الخريطة' : 'Explore on Map'}
        </a>
      </div>

      {/* ─── 2. Search card ────────────────────────────────────────────── */}
      <div className="hz-wrap">
        <div className="hz-searchbar">
          <div className="hz-search-card">
            <div className="hz-search-tabs" role="tablist">
              {HOUEZ_SEARCH_TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={t.id === searchTab}
                  className={t.id === searchTab ? 'active' : ''}
                  onClick={() => setSearchTab(t.id)}
                >
                  {isAr ? t.labelAr : t.label}
                </button>
              ))}
            </div>
            <div className="hz-search-fields">
              <div className="hz-field">
                <label>{isAr ? 'الموقع' : 'Location'}</label>
                <div className="val">
                  <MapPin className="i" />
                  <span>{isAr ? 'القاهرة الجديدة' : 'New Cairo'}</span>
                  <ChevronDown className="chev" />
                </div>
              </div>
              <div className="hz-field">
                <label>{isAr ? 'النوع' : 'Type'}</label>
                <div className="val">
                  <Building2 className="i" />
                  <span>{isAr ? 'الكل' : 'All Types'}</span>
                  <ChevronDown className="chev" />
                </div>
              </div>
              <div className="hz-field">
                <label>{isAr ? 'نطاق السعر' : 'Price Range'}</label>
                <div className="val">
                  <SlidersHorizontal className="i" />
                  <span>{isAr ? 'أي سعر' : 'Any Price'}</span>
                  <ChevronDown className="chev" />
                </div>
              </div>
              <div className="hz-field">
                <label>{isAr ? 'غرف النوم' : 'Bedrooms'}</label>
                <div className="val">
                  <BedDouble className="i" />
                  <span>{isAr ? 'أي عدد' : 'Any'}</span>
                  <ChevronDown className="chev" />
                </div>
              </div>
              <div className="hz-field searchbtn">
                <button
                  className="hz-btn-pri"
                  onClick={() => {
                    if (typeof document !== 'undefined') {
                      document.getElementById('houyez-listings')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <Search size={16} />
                  {isAr ? 'بحث' : 'Search'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. Compounds grid ─────────────────────────────────────────── */}
      <section className="hz-block">
        <div className="hz-wrap">
          <div className="hz-sec-head">
            <div>
              <div className="hz-eyebrow-sm">{isAr ? 'الكمبوندات المميزة' : 'Featured Compounds'}</div>
              <h2>{isAr ? 'استكشف أرقى المجتمعات' : 'Explore Premium Communities'}</h2>
            </div>
            <a className="more" href="#houyez-listings">
              {isAr ? 'عرض الكل' : 'View All'} <ArrowRight size={14} />
            </a>
          </div>
          <div className="hz-grid-comp">
            {compounds.map((c) => (
              <a key={(c as any).id ?? c.name} className="hz-comp" href="#houyez-listings">
                <img src={c.img} alt={isAr ? c.nameAr : c.name} loading="lazy" />
                <div className="co-scrim" />
                <span className="co-count">{c.count} {isAr ? 'عقار' : 'listings'}</span>
                <div className="co-body">
                  <h4>{isAr ? c.nameAr : c.name}</h4>
                  <span>{isAr ? c.zoneAr : c.zone}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. 360° rooms strip ───────────────────────────────────────── */}
      <section className="hz-block" style={{ background: 'var(--hz-bg)' }}>
        <div className="hz-wrap">
          <div className="hz-sec-head">
            <div>
              <div className="hz-eyebrow-sm">{isAr ? 'جولة 360°' : '360° Virtual Tours'}</div>
              <h2>{isAr ? 'تجول داخل العقارات' : 'Step Inside the Properties'}</h2>
            </div>
          </div>
          <div className="hz-rooms">
            {rooms.map((r) => (
              <div key={(r as any).id ?? r.name} className="hz-room">
                <img src={r.img} alt={isAr ? r.nameAr : r.name} loading="lazy" />
                <div className="ro-scrim" />
                <span className="ro-360"><Compass size={11} /> 360°</span>
                <div className="ro-body">
                  <h4>{isAr ? r.nameAr : r.name}</h4>
                  <span>{isAr ? r.subAr : r.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. Listings grid ─────────────────────────────────────────── */}
      <section className="hz-block" id="houyez-listings">
        <div className="hz-wrap">
          <div className="hz-sec-head">
            <div>
              <div className="hz-eyebrow-sm">{isAr ? 'عقارات مختارة بالذكاء الاصطناعي' : 'AI-Curated Listings'}</div>
              <h2>{isAr ? 'عقارات مختارة بعناية' : 'Handpicked for You'}</h2>
            </div>
            <a className="more" href="#" onClick={(e) => e.preventDefault()}>
              {isAr ? 'عرض على الخريطة' : 'View on Map'} <MapIcon size={14} />
            </a>
          </div>

          <div className="hz-toolbar">
            {HOUEZ_TYPE_FILTERS.map((f) => (
              <button
                key={f.id}
                className={`hz-chip${fType === f.id ? ' on' : ''}`}
                onClick={() => setFType(f.id)}
              >
                {isAr ? f.labelAr : f.label}
              </button>
            ))}
            <span className="hz-chip-sep" />
            {HOUEZ_MODE_FILTERS.map((f) => (
              <button
                key={f.id}
                className={`hz-chip${fMode === f.id ? ' on' : ''}`}
                onClick={() => setFMode(f.id)}
              >
                {isAr ? f.labelAr : f.label}
              </button>
            ))}
            <span className="hz-count">
              <b>{filteredListings.length}</b> {isAr ? 'نتيجة' : 'results'}
            </span>
          </div>

          <div className="hz-grid-props">
            {filteredListings.length === 0 ? (
              <div className="hz-empty">
                {isAr ? 'لا توجد عقارات مطابقة. جرّب فلتراً آخر.' : 'No matching properties. Try a different filter.'}
              </div>
            ) : (
              filteredListings.map((p, i) => (
                <article
                  key={(p as any).id ?? p.code}
                  className="hz-pcard"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="img-wrap">
                    <img src={p.img} alt={p.code} loading="lazy" />
                    {p.tag && (
                      <span className={`tag ${tagClass(p.tag)}`}>{isAr ? p.tagAr : p.tag}</span>
                    )}
                    <span className="ai-score" title="AI match score">
                      <Sparkles className="i" /> {p.ai.toFixed(1)}
                    </span>
                    <span className="price-float">{fmtPrice(p)}</span>
                  </div>
                  <div className="body">
                    <div className="ptype">{p.code} · {isAr ? p.typeAr : p.type}</div>
                    <h4>{isAr ? p.cmpAr : p.cmp}</h4>
                    <div className="addr">
                      <MapPin className="i" />
                      {isAr ? p.zoneAr : p.zone}
                    </div>
                    <div className="specs">
                      <span className="spec"><BedDouble className="i" /> {p.beds}</span>
                      <span className="spec"><Bath className="i" /> {p.bath}</span>
                      <span className="spec"><Maximize className="i" /> {p.area} m²</span>
                    </div>
                    <div className="foot">
                      <span className="agent">
                        <span className="dot">{(isAr ? p.agentAr : p.agent).charAt(0)}</span>
                        {isAr ? p.agentAr : p.agent}
                      </span>
                      <span className={`mode-pill ${p.mode}`}>
                        {isAr ? p.modeAr : p.mode === 'sale' ? 'For Sale' : 'For Rent'}
                      </span>
                    </div>
                    <div className="foot" style={{ borderTop: 'none', paddingTop: 0 }}>
                      <span>
                        <Clock size={11} style={{ verticalAlign: -1, marginRight: 4 }} />
                        {isAr ? p.agoAr : p.ago}
                      </span>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        style={{
                          color: 'var(--hz-pri)',
                          fontWeight: 700,
                          fontSize: 13,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {isAr ? 'تفاصيل' : 'Details'} <ArrowRight size={12} />
                      </a>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ─── 6. Stats strip (live) ────────────────────────────────────── */}
      <section className="hz-stats">
        <div className="hz-wrap">
          <div className="grid">
            <div className="stat">
              <b>{stats.total || '—'}</b>
              <span>{isAr ? 'عقار متاح' : 'Live Listings'}</span>
            </div>
            <div className="stat">
              <b>24/7</b>
              <span>{isAr ? 'دعم متخصص' : 'Expert Support'}</span>
            </div>
            <div className="stat">
              <b>100%</b>
              <span>{isAr ? 'عقارات موثقة' : 'Verified Properties'}</span>
            </div>
            <div className="stat">
              <b>{stats.avgAi || '—'}★</b>
              <span>{isAr ? 'متوسط تقييم الذكاء الاصطناعي' : 'Avg AI Match Score'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. 3D Virtual Tour (inline player) ──────────────────────── */}
      {tours.length > 0 && tours[0] && (
        <section
          className="hz-block"
          style={{
            background: 'linear-gradient(135deg, #002b4b 0%, #0a1622 100%)',
            color: '#fff',
            padding: '72px 0',
          }}
        >
          <div className="hz-wrap">
            <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 9,
                    fontFamily: 'var(--hz-mono)',
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: '#8fe1ff',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  <Compass size={14} /> {isAr ? 'جولة ثلاثية الأبعاد' : '3D Virtual Tour'}
                </div>
                <h2
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    margin: 0,
                    lineHeight: 1.15,
                    color: '#fff',
                  }}
                >
                  {isAr ? tours[0].titleAr : tours[0].title}
                </h2>
                {tours[0].subtitle && (
                  <p style={{ marginTop: 10, fontSize: 15, color: 'rgba(255,255,255,0.78)', margin: '10px 0 0' }}>
                    {isAr ? tours[0].subtitleAr : tours[0].subtitle}
                  </p>
                )}
                {tours[0].address && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      marginTop: 12,
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.6)',
                      fontFamily: 'var(--hz-mono)',
                    }}
                  >
                    <MapPin size={13} /> {isAr ? tours[0].addressAr : tours[0].address}
                  </div>
                )}
              </div>
              <a
                href="/clients/tour"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#8fe1ff',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  whiteSpace: 'nowrap',
                }}
              >
                {isAr ? 'عرض بملء الشاشة' : 'Open full page'} <ArrowRight size={14} />
              </a>
            </div>

            <VirtualTourViewer
              src={tours[0].src}
              poster={tours[0].poster}
              title={isAr ? tours[0].titleAr : tours[0].title}
              subtitle={isAr ? tours[0].subtitleAr : tours[0].subtitle}
              aspectRatio="16 / 9"
              autoLoad={false}
              showExternalLink={true}
            />
          </div>
        </section>
      )}

      {/* ─── 8. CTA strip ─────────────────────────────────────────────── */}
      <section className="hz-cta">
        <div className="hz-wrap">
          <h3>{isAr ? 'جاهز لاكتشاف منزلك المثالي؟' : 'Ready to Find Your Perfect Property?'}</h3>
          <p>
            {isAr
              ? 'دع فريقنا يرشدك خلال أرقى العقارات في القاهرة الجديدة.'
              : 'Let our expert team guide you through the finest luxury properties in New Cairo.'}
          </p>
          <a className="btn" href="https://wa.me/201000000000" target="_blank" rel="noopener noreferrer">
            {isAr ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'} <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </section>
  );
}

// ─── Minimal locale hook (avoids pulling in a full i18n provider for now) ───
// Replace with useI18n() once the I18nProvider is wired in.
import { useState as useReactState } from 'react';
function useLocale() {
  const [locale, setLocale] = useReactState<'en' | 'ar'>('en');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('se_locale');
    if (saved === 'ar' || saved === 'en') setLocale(saved);
  }, []);
  return { locale, setLocale };
}
