import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a1622 0%, #002b4b 100%)',
        color: '#fff',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: 720, textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            fontFamily: 'var(--font-mono)',
            fontSize: 11.5,
            fontWeight: 600,
            color: '#8fe1ff',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          <Compass size={14} /> Sierra Estates · SE
        </div>
        <h1
          style={{
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          The Houyez-Style Portal,{' '}
          <span style={{ color: '#00aeff' }}>reborn clean.</span>
        </h1>
        <p
          style={{
            marginTop: 18,
            fontSize: 17,
            color: 'rgba(255,255,255,0.78)',
            lineHeight: 1.6,
          }}
        >
          A fresh Next.js + Firebase stack for Sierra Estates. Dynamic content
          from Firestore, real-time updates, embedded 3D virtual tours, full
          EN/AR support — no tech debt from the old monorepo.
        </p>
        <div style={{ marginTop: 32, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/clients"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: '#00aeff',
              color: '#fff',
              padding: '14px 28px',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
              transition: 'transform .25s ease, background .25s ease',
            }}
          >
            Open Clients Portal <ArrowRight size={16} />
          </Link>
          <Link
            href="/clients/tour"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '14px 28px',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
            }}
          >
            3D Virtual Tour <Compass size={16} />
          </Link>
        </div>

        <div
          style={{
            marginTop: 48,
            padding: '20px 24px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            textAlign: 'left',
            fontFamily: 'var(--font-mono)',
            fontSize: 12.5,
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.7,
          }}
        >
          <div style={{ color: '#8fe1ff', marginBottom: 8 }}>QUICK START</div>
          <div>1. <span style={{ color: '#fff' }}>pnpm install</span></div>
          <div>2. <span style={{ color: '#fff' }}>cp .env.example .env.local</span> → fill in Firebase keys</div>
          <div>3. <span style={{ color: '#fff' }}>pnpm dev</span> → http://localhost:3000/clients</div>
          <div>4. <span style={{ color: '#fff' }}>curl -X POST http://localhost:3000/api/houyez/seed</span></div>
        </div>
      </div>
    </main>
  );
}
