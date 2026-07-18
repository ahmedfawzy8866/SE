'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/components/client/AuthModal';
import './admin-portal.css';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { me, loading } = useAuth();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (loading) return;

    const isAuthorized = me?.signedIn && (me.role === 'admin' || me.role === 'manager');

    if (isLoginPage) {
      if (isAuthorized) {
        router.replace('/admin');
      }
    } else {
      if (!isAuthorized) {
        router.replace('/admin/login');
      }
    }
  }, [me, loading, isLoginPage, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A1628',
          color: 'rgba(244,240,232,.58)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          letterSpacing: '.2em',
        }}
      >
        AUTHENTICATING…
      </div>
    );
  }

  const isAuthorized = me?.signedIn && (me.role === 'admin' || me.role === 'manager');

  if (isLoginPage) {
    if (isAuthorized) return null;
    return <>{children}</>;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <AdminGuard>{children}</AdminGuard>
    </AuthProvider>
  );
}
