import Link from 'next/link';
import { ArrowLeft, Calculator } from 'lucide-react';

export const metadata = {
  title: 'AVM Pricing Engine — Sierra Estates',
  description: 'Instant fair-value estimate for any New Cairo property.',
};

export default function PricingPage() {
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
          <Calculator size={14} /> Intelligence Engine
        </div>
        <h1 style={{ fontSize: 40, margin: '0 0 16px', letterSpacing: '-0.02em' }}>AVM Pricing Engine</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, lineHeight: 1.6 }}>
          Instant fair-value estimate for any New Cairo property.
          <br /><br />
          <em>This module connects to the AVM historical transaction database in Phase 4.</em>
        </p>
      </div>
    </main>
  );
}
