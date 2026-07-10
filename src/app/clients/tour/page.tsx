'use client';

/**
 * /clients/tour — Full-page 3D Virtual Tour viewer.
 * ────────────────────────────────────────────────────────────────────────────
 * Hosts the embedded 3D tour (listing3d / matterport / kuula / etc.) full-screen
 * with the Sierra Estates chrome around it. Reads the active tour from
 * Firestore (`houyez_tours` collection) via the `useHouyezPortal()` hook so
 * admins can swap the tour without touching code.
 *
 * The default tour (when Firestore is empty or in dev) is the Somerville
 * apartment tour from 3dapartment.com:
 *   https://3dapartment.com/powder-house-square/108-central-street-3r-2143/177573
 *   Embed URL: https://listing3d.com/embed/r39d0bd4dde0a4fe693c7fe5fd230a896
 */

import Link from 'next/link';
import { ArrowLeft, MapPin, Building2, Compass } from 'lucide-react';
import { useHouyezPortal } from '@/lib/houyez/useHouyezPortal';
import VirtualTourViewer from '@/components/virtual-tour/VirtualTourViewer';
import { HOUEZ_TOURS } from '@/data/houyez-properties';

export default function TourPage() {
  const { tours, loading } = useHouyezPortal();
  const tour = tours[0] ?? HOUEZ_TOURS[0];
  const isAr = false; // tour page defaults to EN for now

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a1622 0%, #002b4b 100%)',
        color: '#fff',
        fontFamily: 'var(--font-sans)',
      }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '20px 28px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Link
          href="/clients"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#8fe1ff',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <ArrowLeft size={16} style={{ transform: isAr ? 'scaleX(-1)' : undefined }} />
          {isAr ? 'العودة للعملاء' : 'Back to Clients'}
        </Link>
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#bfeaff',
            background: 'rgba(0, 174, 255, 0.12)',
            padding: '6px 12px',
            borderRadius: 999,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <Compass size={12} /> 3D Virtual Tour
        </div>
      </header>

      <section style={{ padding: '40px 28px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            {isAr ? tour.titleAr : tour.title}
          </h1>
          {tour.subtitle && (
            <p style={{ marginTop: 10, fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: '10px 0 0' }}>
              {isAr ? tour.subtitleAr : tour.subtitle}
            </p>
          )}
          {tour.address && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                marginTop: 14,
                fontSize: 13.5,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <MapPin size={14} />
              {isAr ? tour.addressAr : tour.address}
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: '0 28px 60px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {loading ? (
            <div
              style={{
                aspectRatio: '16 / 9',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 12,
                display: 'grid',
                placeItems: 'center',
                color: 'rgba(255,255,255,0.5)',
                fontSize: 14,
                fontFamily: 'var(--font-mono)',
              }}
            >
              Loading tour…
            </div>
          ) : (
            <VirtualTourViewer
              src={tour.src}
              poster={tour.poster}
              title={isAr ? tour.titleAr : tour.title}
              subtitle={isAr ? tour.subtitleAr : tour.subtitle}
              aspectRatio="16 / 9"
              autoLoad={false}
              showExternalLink={true}
            />
          )}
        </div>
      </section>

      <section
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '32px 28px 60px',
          background: 'rgba(0,0,0,0.18)',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                color: '#8fe1ff',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              <Building2 size={12} /> {isAr ? 'المزوّد' : 'Provider'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {tour.provider ? tour.provider.charAt(0).toUpperCase() + tour.provider.slice(1) : 'External'}
            </div>
          </div>
          {tour.propertyCode && (
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  color: '#8fe1ff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                <Compass size={12} /> {isAr ? 'الرمز المرجعي' : 'Reference Code'}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {tour.propertyCode}
              </div>
            </div>
          )}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                color: '#8fe1ff',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              <MapPin size={12} /> {isAr ? 'الموقع' : 'Location'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {isAr ? tour.addressAr ?? tour.address ?? '—' : tour.address ?? '—'}
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1280,
            margin: '32px auto 0',
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 10,
            fontSize: 12.5,
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.6,
          }}
        >
          {isAr
            ? 'تنبيه: الجولة ثلاثية الأبعاد مستضافة من قِبل مزوّد خارجي (listing3d.com). سيتم تشغيلها داخل إطار iframe على موقعنا. لا يتم تخزين بيانات اللاعب على خوادمنا.'
            : 'Note: The 3D tour is hosted by an external provider (listing3d.com). It plays inside an iframe on our site. Player data is not stored on our servers.'}
        </div>
      </section>
    </main>
  );
}
