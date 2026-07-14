'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseClientConfigured } from '@/lib/firebase';
import AdminLogin from './AdminLogin';

/**
 * Auth gate for the single admin page. No chrome — the portal (AdminPortal.tsx)
 * brings its own sidebar/topbar. Staff-gating matches the Firestore rules:
 * users/{uid}.role must be 'admin' or 'manager'.
 *
 * There is no separate `/admin/login` route: when there is no authenticated
 * staff session this gate renders <AdminLogin /> inline, and swaps in the
 * portal once a valid session appears.
 */
type Status = 'loading' | 'authed' | 'unauthed';

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!isFirebaseClientConfigured) {
      // No Firebase config (local dev without .env.local): keep the gate closed.
      setStatus('unauthed');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus('unauthed');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const role = userDoc.data()?.role;

        if (role === 'admin' || role === 'manager') {
          setStatus('authed');
        } else {
          // Signed in but not staff — drop the session and show the login form.
          await signOut(auth).catch(() => {});
          setStatus('unauthed');
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setStatus('unauthed');
      }
    });

    return () => unsubscribe();
  }, []);

  if (status === 'loading') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#07111E',
          color: 'rgba(240,237,229,.58)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          letterSpacing: '.2em',
        }}
      >
        AUTHENTICATING…
      </div>
    );
  }

  if (status === 'unauthed') return <AdminLogin />;

  return <>{children}</>;
}
