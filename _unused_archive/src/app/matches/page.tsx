'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeft, Zap, ShieldCheck, TrendingUp,
  Trophy, BedDouble, Bath, Maximize, Building2, SearchX, PhoneCall,
} from 'lucide-react';

// ── Design tokens (from DESIGN.md) ──────────────────────────────────────────
const T = {
  navy:       '#0A1628',
  ocean:      '#0D1F30',
  bone:       '#F4F0E8',
  ivory:      '#FDFCF9',
  charcoal:   '#1A2535',
  slate:      '#4B5A6A',
  mist:       '#8C9BAB',
  line:       'rgba(26,37,53,0.1)',
  lineStrong: 'rgba(26,37,53,0.15)',
  gold:       '#C9A24D',
  goldHi:     '#E9C176',
  goldDeep:   '#A87C2A',
  green:      '#34d399',   // live-indicator ONLY
  ease:       'cubic-bezier(0.22, 1, 0.36, 1)',
} as const;

const FONTS = {
  display: '"Playfair Display", "Instrument Serif", serif',
  body:    '"Plus Jakarta Sans", "Cairo", sans-serif',
  mono:    '"JetBrains Mono", "Geist Mono", monospace',
} as const;

// ── Seed data ────────────────────────────────────────────────────────────────
const IMGS = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=900&q=80',
  'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=900&q=80',
];

const COMPOUNDS = [
  { n: 'Mivida', z: 'Fifth Settlement' },
  { n: 'Eastown', z: 'Fifth Settlement' },
  { n: 'Hyde Park', z: 'New Cairo' },
  { n: 'Mountain View', z: 'New Cairo' },
  { n: 'Palm Hills', z: 'New Cairo' },
  { n: 'Katameya Heights', z: 'New Cairo' },
  { n: 'Madinaty', z: 'Madinaty' },
  { n: 'El Patio', z: 'El Shorouk' },
  { n: 'Aria', z: 'New Cairo' },
];

const NAMES = [
  'The Glass Pavilion','Aurora Residence','The Meridian',
  'Golden Estate','Palm Suite','Obsidian Loft',
  'Elysian Villa','Skyline Penthouse','Garden Maison',
];

const REASONS = [
  'Direct-owner listing · <b>no commission markup</b>',
  'Yield <b>8.3% net</b> — top decile for the zone',
  'Priced <b>6% below</b> compound median',
  'Matches your <b>3-bed, finished</b> preference',
  'Off-market for 11 days · <b>hidden gem</b>',
  '<b>Walking distance</b> to international school',
  'Below AVM by <b>9.2%</b> — instant equity',
  'Recently finished · <b>move-in ready</b>',
  'Top-floor corner · <b>panoramic garden view</b>',
];

const PROPERTY_TYPES = ['Villa','Penthouse','Twin House','Apartment','Studio','Townhouse'] as const;

interface Listing {
  id: number; name: string; compound: string; zone: string;
  purpose: 'sale' | 'rent'; price: string; beds: number;
  baths: number; area: number; type: string; score: number;
  img: string; reason: string;
}

const LISTINGS: Listing[] = COMPOUNDS.map((c, i) => ({
  id: i + 1,
  name: NAMES[i % NAMES.length],
  compound: c.n,
  zone: c.z,
  purpose: i % 3 === 1 ? 'rent' : 'sale',
  price: i % 3 === 1
    ? `$${(800 + i * 350).toLocaleString()} / mo`
    : `EGP ${(4 + i * 1.6).toFixed(1)}M`,
  beds: 2 + (i % 4),
  baths: 2 + (i % 3),
  area: 180 + i * 30,
  type: PROPERTY_TYPES[i % PROPERTY_TYPES.length],
  score: 99 - i * 2,
  img: IMGS[i % IMGS.length],
  reason: REASONS[i % REASONS.length],
}));

const STATS = [
  { v: '1,847', l: 'Active units scored' },
  { v: '97.3%', l: 'Top match accuracy' },
  { v: '3.1 sec', l: 'Avg match time' },
  { v: '52', l: 'Compounds covered' },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MatchesPage() {
  const [mode, setMode] = useState<'all' | 'sale' | 'rent'>('all');
  const [q, setQ] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const filtered = useMemo(() => {
    let rows = LISTINGS.filter(l => mode === 'all' || l.purpose === mode);
    if (q.trim()) {
      const ql = q.toLowerCase();
      rows = rows.filter(l =>
        l.compound.toLowerCase().includes(ql) || l.name.toLowerCase().includes(ql)
      );
    }
    return [...rows].sort((a, b) => b.score - a.score);
  }, [mode, q]);

  return (
    <main style={{ minHeight: '100dvh', background: T.bone, fontFamily: FONTS.body, color: T.charcoal }}>
      <style>{`
        @keyframes mcIn {
          from { opacity: 0; transform: translateY(24px) perspective(800px) rotateX(-3deg); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes statIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes barGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes se-laser {
          0%   { transform: translateY(0);     opacity: 0; }
          8%   { opacity: .95; }
          92%  { opacity: .95; }
          100% { transform: translateY(640px); opacity: 0; }
        }
        .hero-laser {
          position: absolute; left: 0; right: 0; top: 0; height: 2px; z-index: 2;
          pointer-events: none;
          background: linear-gradient(90deg, transparent, #e9c176 18%, #fff 50%, #c8961a 82%, transparent);
          box-shadow: 0 0 14px 2px rgba(233,193,118,.65);
          opacity: .9;
        }
        @media (prefers-reduced-motion: no-preference) {
          .hero-laser { animation: se-laser 5s cubic-bezier(.6,0,.4,1) infinite; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-laser { display: none; }
          .mc-card, .stat-card { animation: none !important; opacity: 1 !important; }
        }
        .mc-card:hover { transform: translateY(-4px); border-color: rgba(201,162,77,.4) !important; box-shadow: 0 16px 40px rgba(10,22,40,.14) !important; }
        .mc-card { transition: transform .25s cubic-bezier(0.22,1,0.36,1), box-shadow .25s, border-color .25s; }
        .mc-card:hover .mc-img { transform: scale(1.07); }
        .mc-img { transition: transform .6s cubic-bezier(0.22,1,0.36,1); }
        .cta-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(167,124,42,.35) !important; }
        .cta-gold:active { transform: translateY(0) scaleX(.98); }
        .cta-gold { transition: transform .2s cubic-bezier(0.22,1,0.36,1), box-shadow .2s; }
        .seg-btn { transition: background .2s, color .2s; }
        .filter-input:focus { border-color: ${T.gold} !important; outline: none; }
      `}</style>

      {/* Back nav */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '22px 24px 0' }}>
        <Link href="/clients#se-tools" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          color: T.gold, fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700,
          letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none',
        }}>
          <ArrowLeft size={14} /> Back to Portal
        </Link>
      </div>

      {/* ── Hero ── */}
      <section style={{
        background: `linear-gradient(135deg, #07121e 0%, ${T.ocean} 60%, #07121e 100%)`,
        padding: 'clamp(48px,7vw,72px) 24px clamp(40px,6vw,60px)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Laser sweep — matches HouyezPortal se-laser */}
        <div className="hero-laser" />
        {/* Gold radial glow — not cyan */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(700px 360px at 80% 10%, rgba(201,162,77,.16), transparent 60%)`,
        }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700,
            letterSpacing: '.2em', textTransform: 'uppercase', color: T.gold, marginBottom: 18,
          }}>
            <span style={{ width: 28, height: 1.5, background: T.gold, display: 'inline-block', flexShrink: 0 }} />
            AI MATCHING ENGINE · LIVE
          </div>

          {/* H1 — left-aligned, NOT centered */}
          <h1 style={{
            color: '#fff', fontFamily: FONTS.display,
            fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 700,
            letterSpacing: '-.02em', lineHeight: 1.05, margin: 0, maxWidth: 720,
          }}>
            Smart Match{' '}
            <em style={{ fontStyle: 'italic', color: T.goldHi }}>
              — your perfect home, ranked by AI
            </em>
          </h1>

          <p style={{
            color: 'rgba(244,240,232,.78)', marginTop: 16, maxWidth: 580,
            fontSize: 'clamp(14px, 1.8vw, 15.5px)', lineHeight: 1.6,
          }}>
            Sierra's matching engine ranks every active New Cairo listing by your criteria,
            market yield, and direct-owner ratio. No noise — just the units that fit.
          </p>

          {/* Chips */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24 }}>
            {[
              { Icon: Zap, label: 'Real-time scoring' },
              { Icon: ShieldCheck, label: 'Direct-owner verified' },
              { Icon: TrendingUp, label: 'Yield-aware ranking' },
            ].map(({ Icon, label }) => (
              <span key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.13)',
                backdropFilter: 'blur(8px)', padding: '9px 16px', borderRadius: 999,
                color: '#fff', fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700,
                letterSpacing: '.12em', textTransform: 'uppercase',
              }}>
                <Icon size={13} style={{ color: T.gold }} /> {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section style={{ padding: 'clamp(36px,5vw,52px) 24px clamp(60px,8vw,100px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Stats strip */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14, marginBottom: 36,
          }}>
            {STATS.map((s, i) => (
              <div
                key={s.l}
                className="stat-card"
                style={{
                  background: T.ivory, border: `1px solid ${T.line}`,
                  borderRadius: 14, padding: '22px 20px', textAlign: 'center',
                  position: 'relative', overflow: 'hidden',
                  opacity: visible ? 1 : 0,
                  animation: visible ? `statIn .5s ${T.ease} ${i * 60}ms both` : 'none',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.gold}, ${T.goldDeep})` }} />
                <div style={{ fontFamily: FONTS.mono, fontSize: 30, fontWeight: 800, color: T.gold, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: T.mist, marginTop: 8, fontWeight: 700 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div style={{
            display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
            marginBottom: 32, padding: '14px 16px',
            background: T.ivory, border: `1.5px solid ${T.lineStrong}`,
            borderRadius: 14, boxShadow: `0 2px 12px rgba(10,22,40,.06)`,
          }}>
            <div style={{ display: 'flex', gap: 3, padding: 3, background: T.bone, borderRadius: 999 }}>
              {(['all', 'sale', 'rent'] as const).map(v => (
                <button
                  key={v}
                  className="seg-btn"
                  onClick={() => setMode(v)}
                  style={{
                    border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: 999,
                    fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, letterSpacing: '.04em',
                    color: mode === v ? '#fff' : T.mist,
                    background: mode === v ? T.navy : 'transparent',
                  }}
                >
                  {v === 'all' ? 'All' : v === 'sale' ? 'Resale' : 'Rent'}
                </button>
              ))}
            </div>
            <input
              className="filter-input"
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="Filter by compound or name — Mivida, Hyde Park…"
              style={{
                flex: 1, minWidth: 220, border: `1.5px solid ${T.line}`, borderRadius: 999,
                padding: '11px 18px', fontFamily: FONTS.body, fontSize: 14,
                color: T.charcoal, background: T.bone,
              }}
            />
          </div>

          {/* Cards grid */}
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
              {filtered.map((l, i) => (
                <MatchCard key={l.id} listing={l} rank={i + 1} idx={i} visible={visible} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// ── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({ listing: l, rank, idx, visible }: {
  listing: Listing; rank: number; idx: number; visible: boolean;
}) {
  return (
    <div
      className="mc-card"
      style={{
        background: T.ivory, border: `1px solid ${T.line}`, borderRadius: 18,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: `0 2px 12px rgba(10,22,40,.07)`,
        opacity: visible ? 1 : 0,
        animation: visible ? `mcIn .65s ${T.ease} ${idx * 70}ms both` : 'none',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 204, overflow: 'hidden', background: '#e8edf2', flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={l.img} alt={l.name} loading="lazy"
          className="mc-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Scrim */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(7,18,30,.6) 100%)' }} />
        {/* Rank */}
        <span style={{
          position: 'absolute', top: 12, left: 12, zIndex: 2,
          background: 'rgba(255,255,255,.93)', color: T.navy,
          fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800,
          padding: '6px 11px', borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Trophy size={11} style={{ color: T.gold }} /> #{rank}
        </span>
        {/* Score */}
        <span style={{
          position: 'absolute', top: 12, right: 12, zIndex: 2,
          background: 'rgba(9,24,40,.88)', backdropFilter: 'blur(8px)',
          color: T.goldHi, fontFamily: FONTS.mono, fontSize: 12, fontWeight: 800,
          padding: '7px 13px', borderRadius: 999,
          border: `1px solid rgba(233,193,118,.35)`,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {l.score}% match
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Location */}
        <div style={{ fontFamily: FONTS.mono, fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: T.gold, marginBottom: 6, fontWeight: 700 }}>
          {l.compound} · {l.zone}
        </div>
        {/* Name */}
        <div style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 700, color: T.charcoal, marginBottom: 6, letterSpacing: '-.005em', lineHeight: 1.2 }}>
          {l.name}
        </div>
        {/* Price */}
        <div style={{ fontFamily: FONTS.mono, fontSize: 17, fontWeight: 800, color: T.charcoal, marginBottom: 14, fontVariantNumeric: 'tabular-nums' }}>
          {l.price}
        </div>
        {/* Specs */}
        <div style={{ display: 'flex', gap: 14, paddingTop: 12, borderTop: `1px solid ${T.line}`, fontSize: 12.5, color: T.slate, fontWeight: 600, flexWrap: 'wrap' }}>
          {[
            { Icon: Building2, label: l.type },
            { Icon: BedDouble, label: `${l.beds} bed` },
            { Icon: Bath, label: `${l.baths} bath` },
            { Icon: Maximize, label: `${l.area} m²` },
          ].map(({ Icon, label }) => (
            <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon size={13} style={{ color: T.mist }} /> {label}
            </span>
          ))}
        </div>
        {/* Score bar */}
        <div style={{ marginTop: 12, height: 5, background: T.bone, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${l.score}%`,
            background: `linear-gradient(90deg, ${T.gold}, ${T.goldDeep})`,
            borderRadius: 3, transformOrigin: 'left',
            animation: `barGrow 1.4s ${T.ease} ${200 + (rank - 1) * 60}ms both`,
          }} />
        </div>
        {/* AI reason */}
        <div
          style={{ marginTop: 14, fontSize: 12.5, color: T.slate, background: T.bone, borderRadius: 10, padding: '11px 13px', lineHeight: 1.6, flex: 1 }}
          dangerouslySetInnerHTML={{ __html: `<style>b{color:${T.gold};}</style>${l.reason}` }}
        />
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px 20px' }}>
        <Link href={`/property?id=${l.id}`} className="cta-gold" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '12px 20px', borderRadius: 10, textDecoration: 'none',
          background: `linear-gradient(135deg, ${T.gold}, ${T.goldDeep})`,
          color: T.navy, fontFamily: FONTS.body, fontWeight: 800, fontSize: 13,
        }}>
          <PhoneCall size={13} /> Request a Viewing
        </Link>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: 'clamp(60px,10vw,100px) 0', color: T.mist }}>
      <SearchX size={48} style={{ color: T.line, margin: '0 auto 16px' }} />
      <div style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 700, color: T.charcoal, marginBottom: 8 }}>No units matched</div>
      <div style={{ fontFamily: FONTS.body, fontSize: 14, color: T.slate }}>Try a different compound name or switch the mode filter.</div>
    </div>
  );
}
