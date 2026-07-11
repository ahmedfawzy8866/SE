import Link from 'next/link';
import { ArrowLeft, Home, LayoutDashboard, Settings, User } from 'lucide-react';

export const metadata = {
  title: 'My Enrollments — Sierra Estates',
  description: 'Manage your active and past property enrollments.',
};

export default function EnrollmentsPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f8f9fa',
        color: '#1a1a1a',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #eaeaea',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/clients"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#0055aa',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <ArrowLeft size={16} /> Back to Portal
        </Link>
        <div style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>Sierra Estates</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <User size={18} color="#666" />
        </div>
      </header>

      <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', padding: '40px 24px', gap: 48 }}>
        <aside style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', color: '#555', borderRadius: 8, textDecoration: 'none', fontWeight: 500 }}>
            <LayoutDashboard size={18} /> Overview
          </Link>
          <Link href="/enrollments" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#eaf4ff', color: '#0055aa', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            <Home size={18} /> Enrollments
          </Link>
          <Link href="#settings" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', color: '#555', borderRadius: 8, textDecoration: 'none', fontWeight: 500 }}>
            <Settings size={18} /> Settings
          </Link>
        </aside>

        <section style={{ flex: 1 }}>
          <h1 style={{ fontSize: 28, margin: '0 0 24px', letterSpacing: '-0.02em' }}>My Enrollments</h1>
          <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 12, padding: 40, textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px' }}>No active enrollments</h3>
            <p style={{ color: '#666', margin: '0 0 24px' }}>You haven't enrolled in any property programs yet.</p>
            <Link href="/clients#se-featured" style={{ background: '#0055aa', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
              Browse Properties
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
