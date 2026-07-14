'use client';
/**
 * Sierra Estates — Virtual tour (DEFERRED placeholder).
 * The kit's virtual-tour.html is a Three.js/framer-motion 360° drag viewer.
 * That is intentionally deferred for v1 (see report). This page shows a
 * branded "coming soon" gallery preview of the flagship rooms so the /virtual-tour
 * route and all links to it resolve cleanly instead of 404-ing.
 */
import React from 'react';
import Link from 'next/link';
import { Nav, Topbar, Footer, Reveal, SierraConcierge, useT } from './ui';
import { IconRotate3d, IconArrowRight } from './icons';

const ROOMS = [
  { name: 'Luxury Living Room', nameAr: 'غرفة معيشة فاخرة', sub: 'Hyde Park · Grand Villa', img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1400&q=85' },
  { name: 'Master Bedroom Suite', nameAr: 'جناح النوم الرئيسي', sub: 'Mountain View iCity', img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1400&q=85' },
  { name: 'Garden Courtyard', nameAr: 'فناء الحديقة', sub: 'Villette · Villa G-Type', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85' },
  { name: 'Infinity Pool & Deck', nameAr: 'حمام السباحة اللامتناهي', sub: 'Taj City · Signature Villa', img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1400&q=85' },
];

export default function VirtualTourPortal() {
  const { t, locale } = useT();
  const isAr = locale === 'ar';
  return (
    <div className="hz" dir={isAr ? 'rtl' : 'ltr'}>
      <Topbar />
      <Nav />
      <header className="page-hero">
        <div className="wrap">
          <div className="crumbs"><Link href="/">{t('crumbHome')}</Link><span className="sep">/</span><span>{t('ai7t')}</span></div>
          <h1>{t('tourTit')}</h1>
          <p className="sub">{t('tourNote')}</p>
        </div>
      </header>

      <section className="block">
        <div className="wrap">
          <div className="grid-comp">
            {ROOMS.map((r, i) => (
              <Reveal key={r.name} delay={i * 0.08}>
                <div className="comp" style={{ height: 300 }}>
                  <img src={r.img} alt={r.name} loading="lazy" />
                  <div className="co-scrim" />
                  <div className="co-count"><IconRotate3d size={14} /> 360°</div>
                  <div className="co-body"><h4>{isAr ? r.nameAr : r.name}</h4><span>{r.sub}</span></div>
                </div>
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href="/?view=properties" className="btn btn-pri"><span>{t('viewAll')}</span> <IconArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <Footer />
      <SierraConcierge />
    </div>
  );
}
