'use client';
/**
 * Properties section for the single unified client page (migrated from the old
 * PropertiesPortal route). Real Firestore `properties` (fallback to kit data),
 * type + mode filters, sorted by AI score. No page chrome — the parent page
 * (HomePortal) supplies the Topbar/Nav/Footer/Concierge. Property cards open
 * the detail modal via ClientPageContext.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { PropertyCard, Reveal, useT } from './ui';
import { FALLBACK_LISTINGS, fetchListings, Listing } from './portalData';

type TypeFilter = 'all' | 'Villa' | 'Apartment' | 'Town' | 'Pent';
type ModeFilter = 'all' | 'sale' | 'rent';

export default function PropertiesSection() {
  const { t } = useT();
  const [listings, setListings] = useState<Listing[]>(FALLBACK_LISTINGS);
  const [fType, setFType] = useState<TypeFilter>('all');
  const [fMode, setFMode] = useState<ModeFilter>('all');

  useEffect(() => {
    let cancelled = false;
    fetchListings(48).then((live) => { if (!cancelled && live.length) setListings(live); });
    return () => { cancelled = true; };
  }, []);

  const matchType = (p: Listing) => {
    if (fType === 'all') return true;
    if (fType === 'Town') return p.type === 'Twin House' || p.type === 'Townhouse';
    if (fType === 'Pent') return p.type === 'Penthouse' || p.type === 'Duplex';
    return p.type === fType;
  };
  const list = useMemo(
    () => listings.filter((p) => matchType(p) && (fMode === 'all' || p.mode === fMode)).sort((a, b) => b.ai - a.ai),
    [listings, fType, fMode],
  );

  const typeChips: [TypeFilter, string][] = [
    ['all', t('filterAll')], ['Villa', t('filterVilla')], ['Apartment', t('filterApt')],
    ['Town', t('filterTown')], ['Pent', t('filterPent')],
  ];
  const modeChips: [ModeFilter, string][] = [
    ['all', t('modeAll')], ['sale', t('modeSale')], ['rent', t('modeRent')],
  ];

  return (
    <section className="block" id="properties">
      <div className="wrap">
        <Reveal className="sec-head">
          <div>
            <div className="eyebrow">{t('eyeList')}</div>
            <h2>{t('propsTit')}</h2>
            <p>{t('propsSub')}</p>
          </div>
        </Reveal>
        <Reveal className="toolbar">
          {typeChips.map(([k, label]) => (
            <button key={k} type="button" className={`chip${fType === k ? ' on' : ''}`} onClick={() => setFType(k)}>{label}</button>
          ))}
          <span className="chip-sep" />
          {modeChips.map(([k, label]) => (
            <button key={k} type="button" className={`chip${fMode === k ? ' on' : ''}`} onClick={() => setFMode(k)}>{label}</button>
          ))}
          <span className="count"><b>{list.length}</b> {t('results')}</span>
        </Reveal>
        {list.length ? (
          <div className="grid-props">
            {list.map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
          </div>
        ) : (
          <div className="empty">—</div>
        )}
      </div>
    </section>
  );
}
