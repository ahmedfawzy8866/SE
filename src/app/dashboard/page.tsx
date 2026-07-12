'use client';

import Link from 'next/link';
import { ArrowLeft, Home, LayoutDashboard, Settings } from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../../lib/AuthContext';

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <ProtectedRoute>
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
          <div style={{ fontSize: 13, color: '#555' }}>{user?.email}</div>
          <button 
            onClick={() => void signOut()} 
            style={{ background: 'none', border: '1px solid #ddd', padding: '6px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', padding: '40px 24px', gap: 48 }}>
        <aside style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#eaf4ff', color: '#0055aa', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            <LayoutDashboard size={18} /> Overview
          </Link>
          <Link href="/enrollments" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', color: '#555', borderRadius: 8, textDecoration: 'none', fontWeight: 500 }}>
            <Home size={18} /> Enrollments
          </Link>
          <Link href="#settings" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', color: '#555', borderRadius: 8, textDecoration: 'none', fontWeight: 500 }}>
            <Settings size={18} /> Settings
          </Link>
        </aside>

        <section style={{ flex: 1 }}>
          <h1 style={{ fontSize: 28, margin: '0 0 24px', letterSpacing: '-0.02em' }}>Dashboard Overview</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Enrollments</div>
              <div style={{ fontSize: 32, fontWeight: 700, margin: '8px 0' }}>0</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saved Properties</div>
              <div style={{ fontSize: 32, fontWeight: 700, margin: '8px 0' }}>0</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Portfolio Value</div>
              <div style={{ fontSize: 32, fontWeight: 700, margin: '8px 0' }}>—</div>
            </div>
          </div>
          <div style={{ marginTop: 40, padding: 40, background: '#fff', border: '1px dashed #ccc', borderRadius: 12, textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px' }}>Welcome back, {user?.email?.split('@')[0] || 'Client'}!</h3>
            <p style={{ color: '#666', margin: 0 }}>Enroll in a program or save properties to see them here.</p>
          </div>
        </section>
      </div>
    </main>
    </ProtectedRoute>
  );
}
