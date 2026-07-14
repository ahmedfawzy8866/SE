import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Smart Match v3 — Sierra Estates',
  description: 'AI ranks every listing against your brief and budget.',
};

export default function MatchesPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a1622 0%, #002b4b 100%)',
        color: '#fff',
        fontFamily: 'var(--font-sans)',
        padding: '60px 24px',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link
          href="/clients#se-tools"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#8fe1ff',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 40,
          }}
        >
          <ArrowLeft size={16} /> Back to Portal
        </Link>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(0, 174, 255, 0.12)',
            color: '#00aeff',
            padding: '8px 16px',
            borderRadius: 999,
            fontWeight: 600,
            fontSize: 13,
            marginBottom: 20,
          }}
        >
          <Sparkles size={14} /> Intelligence Engine
        </div>
        <h1 style={{ fontSize: 40, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Smart Match v3</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, lineHeight: 1.6 }}>
          AI ranks every listing against your brief and budget.
          <br /><br />
          <em>This module connects to the new openclaw-matching API in Phase 4.</em>
        </p>
      </div>
    </main>
  );
}
