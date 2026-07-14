'use client';
/**
 * Compounds intelligence section for the single unified client page (migrated
 * from the old CompoundsPortal route). Search + zone filters, a live Leaflet
 * intel map (CARTO light tiles, AI-score markers) and compound cards with a
 * side intel panel. No page chrome — the parent page supplies it.
 */
import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Reveal, useT } from './ui';
import { COMPOUNDS, Compound } from './portalData';
import { IconSearch, IconMouseClick, IconArrowRight } from './icons';

const CompoundsMap = dynamic(() => import('./maps').then((m) => m.CompoundsMap), {
  ssr: false,
  loading: () => <div className="mini-map" style={{ height: 540 }} />,
});

const ZONES: [string, 'z1' | 'z2' | 'z3' | 'z4'][] = [
  ['5th Settlement', 'z1'], ['Katameya', 'z2'], ['New Cairo', 'z3'], ['Mostakbal', 'z4'],
];

export default function CompoundsSection() {
  const { t, locale } = useT();
  const isAr = locale === 'ar';
  const [query, setQuery] = useState('');
  const [activeZones, setActiveZones] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Compound | null>(null);

  const matches = (c: Compound) => {
    if (activeZones.size && !activeZones.has(c.z)) return false;
    const q = query.trim().toLowerCase();
    if (q && !c.n.toLowerCase().includes(q) && !c.z.toLowerCase().includes(q)) return false;
    return true;
  };
  const list = useMemo(
    () => COMPOUNDS.filter(matches).sort((a, b) => b.ai - a.ai),
    [query, activeZones],
  );

  const toggleZone = (z: string) =>
    setActiveZones((prev) => {
      const next = new Set(prev);
      if (next.has(z)) next.delete(z); else next.add(z);
      return next;
    });

  return (
    <section className="block well" id="compounds">
      <div className="wrap">
        <Reveal className="sec-head">
          <div>
            <div className="eyebrow">{t('eyeCpd')}</div>
            <h2>{t('cpdsTit')}</h2>
            <p>{t('cpdsSub')}</p>
          </div>
        </Reveal>
        <Reveal className="cpd-toolbar">
          <div className="cpd-search">
            <IconSearch size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('searchCpdPh')} />
          </div>
          <div className="zone-chips">
            {ZONES.map(([z, key]) => {
              const n = COMPOUNDS.filter((c) => c.z === z).length;
              return (
                <button key={z} type="button" className={`zchip${activeZones.has(z) ? ' on' : ''}`} onClick={() => toggleZone(z)}>
                  {t(key)} <span className="zc-n">{n}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="map-shell" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'stretch' }}>
          <CompoundsMap compounds={list} selected={selected} onSelect={setSelected} height={540} />
          <aside className="intel">
            {selected ? (
              <div>
                <h3>{selected.n}</h3>
                <div className="zone" style={{ fontFamily: 'var(--hz-mono)', fontSize: 11.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--pri)', marginBottom: 18 }}>{selected.z} · New Cairo</div>
                {[
                  [t('aiScore'), `${selected.ai.toFixed(1)} / 10`, false],
                  [t('growth'), selected.g, true],
                  [t('avg'), `EGP ${selected.priceM}M`, false],
                  [t('rentAvg'), `$${selected.rent.toLocaleString()}/mo`, false],
                ].map(([label, val, up], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 0', borderBottom: '1px solid var(--line)', fontSize: 13.5 }}>
                    <span>{label as string}</span>
                    <b style={{ fontFamily: 'var(--hz-mono)', fontSize: 16, color: up ? 'var(--green)' : 'var(--ink)' }}>{val as string}</b>
                  </div>
                ))}
                <a href="#properties" className="btn btn-pri" style={{ marginTop: 18 }}><IconArrowRight size={16} /> {t('viewAll')}</a>
              </div>
            ) : (
              <div className="hint" style={{ margin: 'auto 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--muted)' }}>
                <IconMouseClick size={28} />
                <span>{isAr ? 'اختر كمبوند لعرض بياناته هنا' : 'Select a compound to see its intel here'}</span>
              </div>
            )}
          </aside>
        </div>

        {list.length ? (
          <div className="grid-cpds" style={{ marginTop: 56 }}>
            {list.map((c, i) => (
              <Reveal key={c.n} delay={(i % 3) * 0.06}>
                <div className="cpd-card" onClick={() => setSelected(c)}>
                  <div className="zline">{c.z}</div>
                  <div className="top"><h4>{c.n}</h4><span className="ai-pill">AI {c.ai.toFixed(1)}</span></div>
                  <div className="meta">
                    <span>{t('growth')} <b className="up">{c.g}</b></span>
                    <span>{t('avg')} <b>EGP {c.priceM}M</b></span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="empty" style={{ marginTop: 40 }}>{t('noCpd')}</div>
        )}
      </div>
    </section>
  );
}
