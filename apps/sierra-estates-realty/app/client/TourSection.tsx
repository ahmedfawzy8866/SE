'use client';
/**
 * Virtual-tour section for the single unified client page (migrated from the
 * old VirtualTourPortal route). A branded 360° gallery preview of the flagship
 * rooms. No page chrome — the parent page supplies it.
 */
import React from 'react';
import { Reveal, useT } from './ui';
import { IconRotate3d, IconArrowRight } from './icons';

const ROOMS = [
  { name: 'Luxury Living Room', nameAr: 'غرفة معيشة فاخرة', sub: 'Hyde Park · Grand Villa', img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1400&q=85' },
  { name: 'Master Bedroom Suite', nameAr: 'جناح النوم الرئيسي', sub: 'Mountain View iCity', img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1400&q=85' },
  { name: 'Garden Courtyard', nameAr: 'فناء الحديقة', sub: 'Villette · Villa G-Type', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85' },
  { name: 'Infinity Pool & Deck', nameAr: 'حمام السباحة اللامتناهي', sub: 'Taj City · Signature Villa', img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1400&q=85' },
];

export default function TourSection() {
  const { t, locale } = useT();
  const isAr = locale === 'ar';
  return (
    <section className="block well" id="tour">
      <div className="wrap">
        <Reveal className="sec-head">
          <div>
            <div className="eyebrow">{t('eyeTour')}</div>
            <h2>{t('tourTit')}</h2>
            <p>{t('tourNote')}</p>
          </div>
        </Reveal>
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
          <a href="#properties" className="btn btn-pri"><span>{t('viewAll')}</span> <IconArrowRight size={16} /></a>
        </div>
      </div>
    </section>
  );
}
