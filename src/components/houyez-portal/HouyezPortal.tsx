'use client';

/**
 * Sierra Estates — Client Portal (refined design)
 * ────────────────────────────────────────────────────────────────────────────
 * Wired from the design handoff (ui_kits/client-page). Faithful React port of
 * the refined "Every listing scored" portal, driven by the live Firestore data
 * layer (useHouyezPortal → houyez_* collections, seed fallback).
 *
 * Sections: Nav chrome (theme + EN/AR toggle) · Hero (slideshow + search card)
 * · Market ticker · Featured properties · Compounds · Why Sierra + network
 * · 3D virtual tour · Intelligence Engine · CTA · Footer · concierge FAB.
 *
 * Deferred to a follow-up (see PR notes): the interactive Leaflet Smart Map and
 * the standalone AI-tool routes (/matches, /pricing, /roi) — both need extra
 * deps / new routes and are intentionally out of this first wiring pass.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MapPin, Search, BedDouble, Bath, Maximize, Sparkles, Compass,
  BadgeCheck, ArrowRight, Sun, Moon, Heart, TrendingUp, Calculator,
  MessageCircle, AlertCircle,
} from 'lucide-react';
import { useHouyezPortal } from '@/lib/houyez/useHouyezPortal';
import {
  HOUEZ_SLIDES, HOUEZ_SEARCH_TABS, HOUEZ_TYPE_FILTERS,
  type HouyezListing,
} from '@/data/houyez-properties';
import VirtualTourViewer from '@/components/virtual-tour/VirtualTourViewer';
import dynamic from 'next/dynamic';
import './houyez-portal.css';

const LiveMap = dynamic(() => import('@/components/Maps/LiveMap'), { ssr: false });

const HERO_INTERVAL_MS = 6000;
type Locale = 'en' | 'ar';
type Theme = 'light' | 'dark';

const NAV_LINKS = [
  { href: '#se-featured', en: 'Properties', ar: 'العقارات' },
  { href: '#se-compounds', en: 'Compounds', ar: 'الكمبوندات' },
  { href: '#se-why', en: 'Why Sierra', ar: 'لماذا سييرا' },
  { href: '#se-tools', en: 'AI Tools', ar: 'أدوات الذكاء' },
  { href: '#se-contact', en: 'Contact', ar: 'اتصل بنا' },
];

const ADVANTAGES = [
  { icon: Search, en: ['One market, one search', 'We scan the whole New Cairo market — not just our own units.'], ar: ['سوق واحد، بحث واحد', 'نبحث في سوق القاهرة الجديدة بالكامل، وليس وحداتنا فقط.'] },
  { icon: Calculator, en: ['Precise AVM pricing', 'AI valuation on every listing so you never overpay.'], ar: ['تسعير AVM دقيق', 'تقييم بالذكاء الاصطناعي لكل عقار حتى لا تدفع أكثر.'] },
  { icon: BadgeCheck, en: ['Verified inventory', 'Every listing is checked on-site before it reaches your feed.'], ar: ['مخزون موثق', 'يتم فحص كل عقار على الطبيعة قبل عرضه.'] },
  { icon: Sparkles, en: ['Human + AI closing', 'AI-sourced matches paired with expert advisors to signed contract.'], ar: ['إغلاق بشري + ذكاء', 'توافق بالذكاء الاصطناعي مع مستشارين خبراء حتى توقيع العقد.'] },
];

const TOOLS = [
  { icon: Sparkles, href: '/matches', en: ['Smart Match v3', 'AI ranks every listing against your brief and budget.'], ar: ['المطابقة الذكية v3', 'يرتب الذكاء الاصطناعي كل عقار حسب متطلباتك وميزانيتك.'] },
  { icon: Calculator, href: '/pricing', en: ['AVM Pricing Engine', 'Instant fair-value estimate for any New Cairo property.'], ar: ['محرك تسعير AVM', 'تقدير فوري للقيمة العادلة لأي عقار.'] },
  { icon: TrendingUp, href: '/roi', en: ['ROI Forecaster', 'Project rental yield and appreciation over your horizon.'], ar: ['متنبئ العائد', 'توقع العائد الإيجاري والارتفاع على مدى استثمارك.'] },
];

export default function HouyezPortal() {
  const { slides, compounds, listings, tours, usingSeed } = useHouyezPortal();

  const [theme, setTheme] = useState<Theme>('light');
  const [locale, setLocale] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);
  const isAr = locale === 'ar';
  const portalRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ── persisted theme + locale (also marks JS active so reveal can hide) ─────
  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;
    const t = localStorage.getItem('se_theme');
    const l = localStorage.getItem('se_locale');
    if (t === 'dark' || t === 'light') setTheme(t);
    if (l === 'ar' || l === 'en') setLocale(l);
  }, []);
  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') localStorage.setItem('se_theme', next);
      return next;
    });
  }, []);
  const toggleLocale = useCallback(() => {
    setLocale((l) => {
      const next = l === 'ar' ? 'en' : 'ar';
      if (typeof window !== 'undefined') localStorage.setItem('se_locale', next);
      return next;
    });
  }, []);

  // ── hero slideshow ────────────────────────────────────────────────────────
  const [slideIdx, setSlideIdx] = useState(0);
  useEffect(() => {
    if (slideIdx >= slides.length) setSlideIdx(0);
  }, [slides.length, slideIdx]);
  useEffect(() => {
    if (slides.length <= 1) return;
    if (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setSlideIdx((i) => (i + 1) % slides.length), HERO_INTERVAL_MS);
    return () => clearInterval(t);
  }, [slides.length]);

  // ── nav solid on scroll (sentinel, no scroll listener) ────────────────────
  const [navSolid, setNavSolid] = useState(false);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setNavSolid(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ── reveal-on-scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    const root = portalRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('.rv'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [listings.length, compounds.length]);

  // ── search / filter state ─────────────────────────────────────────────────
  const [searchTab, setSearchTab] = useState<typeof HOUEZ_SEARCH_TABS[number]['id']>('buy');
  const [fType, setFType] = useState<string>('all');
  const [fBeds, setFBeds] = useState<string>('any');
  const [fLoc, setFLoc] = useState<string>('all');
  const [fPrice, setFPrice] = useState<string>('any');

  const modeForTab = searchTab === 'rent' ? 'rent' : 'sale';
  const matchType = useCallback((p: HouyezListing) => {
    if (fType === 'all') return true;
    if (fType === 'Town') return p.type === 'Twin House';
    if (fType === 'Pent') return p.type === 'Penthouse' || p.type === 'Duplex';
    return p.type === fType;
  }, [fType]);

  const zones = useMemo(
    () => Array.from(new Set(listings.map((l) => (isAr ? l.zoneAr : l.zone)))).sort(),
    [listings, isAr],
  );

  const featured = useMemo(() => {
    return listings
      .filter((p) =>
        p.mode === modeForTab &&
        matchType(p) &&
        (fBeds === 'any' || p.beds >= Number(fBeds)) &&
        (fLoc === 'all' || (isAr ? p.zoneAr : p.zone) === fLoc) &&
        (fPrice === 'any' || p.mode !== 'sale' || p.egpM <= Number(fPrice)))
      .sort((a, b) => b.ai - a.ai)
      .slice(0, 9);
  }, [listings, modeForTab, matchType, fBeds, fLoc, fPrice, isAr]);

  // ── saved (hearts) ────────────────────────────────────────────────────────
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const toggleSave = useCallback((code: string) => {
    setSaved((s) => {
      const next = new Set(s);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  }, []);

  const scrollTo = useCallback((id: string) => {
    if (typeof document !== 'undefined') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const slide = slides[slideIdx] ?? slides[0] ?? HOUEZ_SLIDES[0];
  const t = (en: string, ar: string) => (isAr ? ar : en);

  const fmtPrice = (p: HouyezListing) =>
    p.mode === 'sale'
      ? { main: `EGP ${p.egpM}M`, sub: '' }
      : { main: `$${p.usd.toLocaleString()}`, sub: '/mo' };

  const tickerItems = useMemo(() => {
    const items = [
      t('1,900+ verified listings', '+1,900 عقار موثق'),
      t('50+ compounds covered', '+50 كمبوند'),
      t('AI valuation on every unit', 'تقييم ذكي لكل وحدة'),
      t('RERA-licensed brokers', 'وسطاء مرخصون'),
      t('New Cairo · Mostakbal · Sheikh Zayed', 'القاهرة الجديدة · المستقبل · الشيخ زايد'),
    ];
    return [...items, ...items];
  }, [isAr]);

  return (
    <div className={`se-portal${mounted ? ' js' : ''}`} data-theme={theme} dir={isAr ? 'rtl' : 'ltr'} ref={portalRef}>
      {usingSeed && (
        <div className="seed-note">
          <AlertCircle size={11} style={{ verticalAlign: -1, marginInlineEnd: 6 }} />
          {t('Demo data — POST /api/houyez/seed to populate Firestore',
             'بيانات تجريبية — شغّل POST /api/houyez/seed لتعبئة Firestore')}
        </div>
      )}

      {/* ── NAV ── */}
      <header className={`nav${navSolid ? ' solid' : ''}`}>
        <div className="wrap nav-in">
          <div className="brand" onClick={() => scrollTo('se-top')}>
            <span className="mark"><span>SE</span></span>
            <div>
              <b>Sierra Estates</b>
              <small>{t('Future of Real Estate', 'مستقبل العقارات')}</small>
            </div>
          </div>
          <nav className="nav-links">
            {NAV_LINKS.map((l) => (
              <button type="button" key={l.href} onClick={() => scrollTo(l.href.slice(1))}>
                {isAr ? l.ar : l.en}
              </button>
            ))}
          </nav>
          <div className="nav-act">
            <button className="icon-btn" onClick={toggleTheme}
              aria-label={theme === 'dark' ? t('Switch to light theme', 'الوضع الفاتح') : t('Switch to dark theme', 'الوضع الداكن')}>
              {theme === 'dark' ? <Sun className="i" /> : <Moon className="i" />}
            </button>
            <button className="icon-btn lang-btn" onClick={toggleLocale}
              aria-label={t('Switch to Arabic', 'التبديل إلى الإنجليزية')}>
            </button>
            <button className="btn btn-pri nav-cta" onClick={() => scrollTo('se-contact')}>
              {t('Get in touch', 'تواصل معنا')}
            </button>
          </div>
        </div>
      </header>

      <div id="se-top" ref={sentinelRef} />

      {/* ── HERO ── */}
      <section className="hero">
        {slides.map((s, i) => (
          <div key={s.id ?? i} className={`slide${i === slideIdx ? ' on' : ''}`} aria-hidden={i !== slideIdx}>
            <img src={s.img} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
          </div>
        ))}
        <div className="scrim" />
        <div className="laser" />
        <div className="wrap h-wrap">
          <div className="h-eyebrow">{isAr ? slide.preAr : slide.pre}</div>
          <h1>
            {(() => {
              const txt = isAr ? slide.mainAr : slide.main;
              const ci = txt.search(/[,،]/);
              if (ci < 0) return txt;
              return (<>{txt.slice(0, ci + 1)} <span className="hl">{txt.slice(ci + 1).trim()}</span></>);
            })()}
          </h1>
          <p className="h-sub">
            {t('Discover AI-curated luxury properties in New Cairo — rent, resale, and exclusive off-plan.',
               'اكتشف عقارات القاهرة الجديدة الفاخرة المختارة بالذكاء الاصطناعي — إيجار، إعادة بيع، وحصري.')}
          </p>
          <div className="h-quick">
            <span><BadgeCheck className="i" /> {t('1,900+ verified listings', '+1,900 عقار موثق')}</span>
            <span><Compass className="i" /> {t('50+ compounds', '+50 كمبوند')}</span>
            <span><Sparkles className="i" /> {t('RERA-licensed brokers', 'وسطاء مرخصون')}</span>
          </div>
        </div>
        <div className="dots" role="tablist" aria-label="hero slides">
          {slides.map((s, i) => (
            <button key={s.id ?? i} role="tab" aria-selected={i === slideIdx}
              aria-label={`slide ${i + 1}`} className={i === slideIdx ? 'on' : ''}
              onClick={() => setSlideIdx(i)} />
          ))}
        </div>
      </section>

      {/* ── SEARCH CARD ── */}
      <div className="wrap">
        <div className="search-card">
          <div className="search-tabs" role="tablist">
            {HOUEZ_SEARCH_TABS.map((tab) => (
              <button key={tab.id} role="tab" aria-selected={tab.id === searchTab}
                className={tab.id === searchTab ? 'active' : ''} onClick={() => setSearchTab(tab.id)}>
                {isAr ? tab.labelAr : tab.label}
              </button>
            ))}
          </div>
          <div className="search-fields">
            <div className="field">
              <label>{t('Location', 'الموقع')}</label>
              <select value={fLoc} onChange={(e) => setFLoc(e.target.value)} aria-label={t('Location', 'الموقع')}>
                <option value="all">{t('All areas', 'كل المناطق')}</option>
                {zones.map((z) => (<option key={z} value={z}>{z}</option>))}
              </select>
            </div>
            <div className="field">
              <label>{t('Type', 'النوع')}</label>
              <select value={fType} onChange={(e) => setFType(e.target.value)}>
                {HOUEZ_TYPE_FILTERS.map((f) => (<option key={f.id} value={f.id}>{isAr ? f.labelAr : f.label}</option>))}
              </select>
            </div>
            <div className="field">
              <label>{t('Bedrooms', 'غرف النوم')}</label>
              <select value={fBeds} onChange={(e) => setFBeds(e.target.value)}>
                <option value="any">{t('Any', 'أي')}</option>
                {[1, 2, 3, 4, 5].map((n) => (<option key={n} value={String(n)}>{n}+</option>))}
              </select>
            </div>
            <div className="field">
              <label>{t('Max price', 'أقصى سعر')}</label>
              <select value={fPrice} onChange={(e) => setFPrice(e.target.value)}
                aria-label={t('Max price', 'أقصى سعر')}
                disabled={modeForTab !== 'sale'}>
                <option value="any">{t('Any price', 'أي سعر')}</option>
                {[5, 10, 20, 30, 50].map((m) => (
                  <option key={m} value={String(m)}>{t(`Up to ${m}M EGP`, `حتى ${m} مليون`)}</option>
                ))}
              </select>
            </div>
            <div className="field searchbtn">
              <button className="btn btn-pri" onClick={() => scrollTo('se-featured')}>
                <Search size={16} /> {t('Search', 'بحث')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MARKET TICKER ── */}
      <div className="ticker" aria-hidden>
        <div className="row">
          {tickerItems.map((it, i) => (<span key={i}><b>·</b> {it}</span>))}
        </div>
      </div>

      {/* ── FEATURED PROPERTIES ── */}
      <section className="block" id="se-featured">
        <div className="wrap">
          <div className="sec-head rv">
            <div>
              <div className="eyebrow">{t('AI-curated inventory', 'مخزون مختار بالذكاء')}</div>
              <h2>{t('Properties worth your attention', 'عقارات تستحق اهتمامك')}</h2>
              <p>{t('Ranked by AI match score across the whole New Cairo market.',
                    'مرتبة حسب درجة التوافق بالذكاء الاصطناعي عبر سوق القاهرة الجديدة.')}</p>
            </div>
            <a className="sec-link" href="#se-compounds" onClick={(e) => { e.preventDefault(); scrollTo('se-compounds'); }}>
              {t('View all listings', 'عرض كل العقارات')} <ArrowRight size={15} />
            </a>
          </div>
          <div className="grid-props">
            {featured.length === 0 ? (
              <div className="empty">{t('No matching properties. Try another filter.', 'لا توجد عقارات مطابقة. جرّب فلتراً آخر.')}</div>
            ) : featured.map((p, i) => {
              const price = fmtPrice(p);
              const on = saved.has(p.code);
              return (
                <article key={p.id ?? p.code} className="pcard rv" style={{ transitionDelay: `${(i % 3) * 60}ms` }}>
                  <div className="p-img">
                    <img src={p.img} alt={p.code} loading="lazy" />
                    <span className="p-code">{p.code}</span>
                    {p.tag && <span className="p-tag">{isAr ? p.tagAr : p.tag}</span>}
                    <button className={`p-heart${on ? ' on' : ''}`} aria-label="Save"
                      aria-pressed={on} onClick={() => toggleSave(p.code)}>
                      <Heart className="i" />
                    </button>
                    <div className="p-aibar" style={{ '--ai': `${Math.min(p.ai * 10, 100)}%` } as React.CSSProperties}>
                      <i />
                    </div>
                  </div>
                  <div className="p-body">
                    <div className="p-price">{price.main}{price.sub && <small>{price.sub}</small>}</div>
                    <div className="p-title">{isAr ? p.cmpAr : p.cmp}</div>
                    <div className="p-loc"><MapPin className="i" /> {isAr ? p.zoneAr : p.zone} · {isAr ? p.typeAr : p.type}</div>
                    <div className="p-meta">
                      <span><BedDouble className="i" /> {p.beds}</span>
                      <span><Bath className="i" /> {p.bath}</span>
                      <span><Maximize className="i" /> {p.area} m²</span>
                      <span style={{ marginInlineStart: 'auto', color: 'var(--pri)' }}><Sparkles className="i" /> {p.ai.toFixed(1)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMPOUNDS ── */}
      <section className="block well" id="se-compounds">
        <div className="wrap">
          <div className="sec-head rv">
            <div>
              <h2>{t('Explore premium communities', 'استكشف أرقى المجتمعات')}</h2>
              <p>{t('New Cairo’s most sought-after compounds, ranked by growth and demand.',
                    'أكثر كمبوندات القاهرة الجديدة طلباً، مرتبة حسب النمو والطلب.')}</p>
            </div>
          </div>
          <div className="grid-comp">
            {compounds.slice(0, 8).map((c, i) => (
              <a key={c.id ?? c.name} className="comp rv" href="#se-featured"
                 style={{ transitionDelay: `${(i % 4) * 60}ms` }}
                 onClick={(e) => { e.preventDefault(); scrollTo('se-featured'); }}>
                <img src={c.img} alt={isAr ? c.nameAr : c.name} loading="lazy" />
                <div className="co-scrim" />
                <span className="co-count">{c.count} {t('listings', 'عقار')}</span>
                <div className="co-body">
                  <h4>{isAr ? c.nameAr : c.name}</h4>
                  <span>{isAr ? c.zoneAr : c.zone}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE MAP ── */}
      <section className="block" id="se-map" style={{ padding: 0 }}>
        <div style={{ height: '500px', width: '100%', position: 'relative' }}>
          <LiveMap mode={theme} />
          <div className="co-scrim" style={{ pointerEvents: 'none', background: 'linear-gradient(0deg, var(--bg) 0%, transparent 20%, transparent 80%, var(--bg) 100%)' }} />
        </div>
      </section>

      {/* ── WHY SIERRA ── */}
      <section className="block" id="se-why">
        <div className="wrap">
          <div className="why rv">
            <div className="why-intro">
              <h2>{t('The whole market, working for you', 'السوق بأكمله، يعمل لصالحك')}</h2>
              <p>{t('Most brokers show you their own units. Sierra searches every listing in New Cairo, scores it, and surfaces only what fits — so you see the best of the market, not the best of one inventory.',
                    'معظم الوسطاء يعرضون وحداتهم فقط. سييرا تبحث في كل عقار بالقاهرة الجديدة، تقيّمه، وتعرض ما يناسبك فقط — لترى أفضل السوق، لا أفضل مخزون واحد.')}</p>
            </div>
            <div className="adv-list">
              {ADVANTAGES.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} className="adv-row">
                    <div className="ic"><Icon className="i" /></div>
                    <div>
                      <h4>{isAr ? a.ar[0] : a.en[0]}</h4>
                      <p>{isAr ? a.ar[1] : a.en[1]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="net rv">
            <div>
              <h3>{t("We don't sell only our own units", 'نحن لا نبيع وحداتنا فقط')}</h3>
              <p>{t('We search the entire New Cairo market for you — partner brokers, developers, and resale owners, all in one place.',
                    'نبحث في سوق القاهرة الجديدة بالكامل نيابةً عنك — وسطاء شركاء ومطورون وملاك إعادة بيع في مكان واحد.')}</p>
            </div>
            <div className="net-stats">
              <div><b>1,500+</b><span>{t('partner brokers', 'وسيط شريك')}</span></div>
              <div><b>240+</b><span>{t('brokerage firms', 'شركة وساطة')}</span></div>
              <div><b>100%</b><span>{t('New Cairo', 'القاهرة الجديدة')}</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3D VIRTUAL TOUR ── */}
      {tours.length > 0 && tours[0] && (
        <section className="tour-block">
          <div className="wrap">
            <div className="sec-head rv" style={{ alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 30 }}>{isAr ? tours[0].titleAr : tours[0].title}</h2>
              </div>
              <a className="sec-link" href="/clients/tour" style={{ color: '#8fe1ff' }}>
                {t('Open full page', 'عرض بملء الشاشة')} <ArrowRight size={14} />
              </a>
            </div>
            <VirtualTourViewer
              src={tours[0].src}
              poster={tours[0].poster}
              title={isAr ? tours[0].titleAr : tours[0].title}
              subtitle={isAr ? tours[0].subtitleAr : tours[0].subtitle}
              aspectRatio="16 / 9"
              autoLoad={false}
              showExternalLink
            />
          </div>
        </section>
      )}

      {/* ── INTELLIGENCE ENGINE ── */}
      <section className="block well" id="se-tools">
        <div className="wrap">
          <div className="sec-head rv">
            <div>
              <h2>{t('The Intelligence Engine', 'محرك الذكاء')}</h2>
              <p>{t('Three live AI tools that price, match, and forecast every deal.',
                    'ثلاث أدوات ذكاء حية تسعّر، تطابق، وتتنبأ بكل صفقة.')}</p>
            </div>
          </div>
          <div className="ai-grid">
            {TOOLS.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <a key={tool.href} href={tool.href} className="ai-tile rv" style={{ transitionDelay: `${i * 60}ms` }}>
                  <span className="live"><span className="dot" /> LIVE</span>
                  <div className="ic"><Icon className="i" /></div>
                  <h4>{isAr ? tool.ar[0] : tool.en[0]}</h4>
                  <p>{isAr ? tool.ar[1] : tool.en[1]}</p>
                  <span className="go">{t('Launch', 'تشغيل')} <ArrowRight size={14} /></span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta" id="se-contact">
        <div className="wrap">
          <h3>{t('Have a property in New Cairo to sell or rent?', 'لديك عقار في القاهرة الجديدة للبيع أو الإيجار؟')}</h3>
          <p>{t('List with Sierra and reach verified buyers across the whole market, or talk to an advisor today.',
                'اعرض مع سييرا وصِل إلى مشترين موثقين عبر السوق بالكامل، أو تحدث مع مستشار اليوم.')}</p>
          <div className="cta-row">
            <a className="btn btn-pri" href="https://wa.me/201092048333" target="_blank" rel="noopener noreferrer">
              {t('List your property', 'اعرض عقارك')} <ArrowRight size={16} />
            </a>
            <a className="btn btn-ghost" href="https://wa.me/201092048333" target="_blank" rel="noopener noreferrer"
               style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>
              {t('Talk to an agent', 'تحدث مع وكيل')}
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="wrap">
          <div className="f-top">
            <div className="f-brand">
              <b>Sierra Estates</b>
              <p>{t('AI-curated luxury real estate in New Cairo. One market, one search, verified inventory.',
                    'عقارات فاخرة مختارة بالذكاء الاصطناعي في القاهرة الجديدة. سوق واحد، بحث واحد، مخزون موثق.')}</p>
            </div>
            <div className="f-col">
              <h5>{t('Explore', 'استكشف')}</h5>
              <a href="#se-featured" onClick={(e) => { e.preventDefault(); scrollTo('se-featured'); }}>{t('Properties', 'العقارات')}</a>
              <a href="#se-compounds" onClick={(e) => { e.preventDefault(); scrollTo('se-compounds'); }}>{t('Compounds', 'الكمبوندات')}</a>
              <a href="#se-tools" onClick={(e) => { e.preventDefault(); scrollTo('se-tools'); }}>{t('AI Tools', 'أدوات الذكاء')}</a>
            </div>
            <div className="f-col">
              <h5>{t('Company', 'الشركة')}</h5>
              <a href="#se-why" onClick={(e) => { e.preventDefault(); scrollTo('se-why'); }}>{t('Why Sierra', 'لماذا سييرا')}</a>
              <a href="#se-contact" onClick={(e) => { e.preventDefault(); scrollTo('se-contact'); }}>{t('Contact', 'اتصل بنا')}</a>
              <a href="/clients/tour">{t('Virtual tours', 'جولات افتراضية')}</a>
            </div>
            <div className="f-col">
              <h5>{t('Contact', 'اتصل بنا')}</h5>
              <a href="mailto:info@Sierra-Estates.net">info@Sierra-Estates.net</a>
              <a href="https://wa.me/201092048333">+20 109 204 8333</a>
              <a>{t('Banafseg 2, Villa 402, New Cairo', 'البنفسج 2، فيلا 402، القاهرة الجديدة')}</a>
            </div>
          </div>
          <div className="f-bot">
            <span>© {new Date().getFullYear()} Sierra Estates. {t('All rights reserved.', 'جميع الحقوق محفوظة.')}</span>
            <span className="mono">New Cairo · Egypt</span>
          </div>
        </div>
      </footer>

      {/* ── CONCIERGE FAB ── */}
      <button className="fab" aria-label={t('Open concierge', 'افتح المساعد')}
        onClick={() => window.open('https://wa.me/201092048333', '_blank', 'noopener')}>
        <MessageCircle size={24} />
        <span className="badge">AI</span>
      </button>
    </div>
  );
}
