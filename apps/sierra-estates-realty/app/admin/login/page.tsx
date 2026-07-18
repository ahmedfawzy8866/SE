'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseClientConfigured } from '@/lib/firebase';
import { api } from '@/lib/api-client';
import '../admin-portal.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isFirebaseClientConfigured) {
        const { getIdToken } = await import('firebase/auth');
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const token = await getIdToken(cred.user);
        
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'signin', email, token }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Authorization failed.');
        }

        if (data.role !== 'admin' && data.role !== 'manager') {
          await fetch('/api/auth', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ action: 'signout' }),
          });
          throw new Error('Access denied. Staff only.');
        }
      } else {
        const data = await api.signIn(email, password);
        if (data.role !== 'admin' && data.role !== 'manager') {
          await api.signOut();
          throw new Error('Access denied. Staff only.');
        }
      }
      router.replace('/admin');
    } catch (err: any) {
      setError(err?.message ?? 'Invalid credentials. Staff access only.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      if (isFirebaseClientConfigured) {
        const { GoogleAuthProvider, signInWithPopup, getIdToken } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);
        const userEmail = cred.user.email || '';
        const token = await getIdToken(cred.user);

        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'signin', email: userEmail, token }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Authorization failed.');
        }

        if (data.role !== 'admin' && data.role !== 'manager') {
          await fetch('/api/auth', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ action: 'signout' }),
          });
          throw new Error('Access denied. Staff only.');
        }

        router.replace('/admin');
      } else {
        setError('Firebase client not configured. Google Sign-In is only available with Firebase enabled.');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Google Sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(900px 600px at 85% 0%, rgba(0,174,255,.10), transparent 60%), #07111E',
        padding: 16,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 380,
          background: 'rgba(255,255,255,.055)',
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 16,
          padding: 32,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            className="gold-text"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '.22em',
            }}
          >
            SIERRA ESTATES 3.0
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              letterSpacing: '.18em',
              color: 'rgba(240,237,229,.32)',
              textTransform: 'uppercase',
              marginTop: 6,
            }}
          >
            Intelligence OS · Staff Portal
          </div>
        </div>

        <label
          style={{
            display: 'block',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '.15em',
            textTransform: 'uppercase',
            color: 'rgba(240,237,229,.58)',
            marginBottom: 6,
          }}
        >
          Email
        </label>
        <input
          className="f-in"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="staff@sierra-estates.net"
          style={{ marginBottom: 16, color: '#F0EDE5' }}
        />

        <label
          style={{
            display: 'block',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '.15em',
            textTransform: 'uppercase',
            color: 'rgba(240,237,229,.58)',
            marginBottom: 6,
          }}
        >
          Password
        </label>
        <input
          className="f-in"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={{ marginBottom: 20, color: '#F0EDE5' }}
        />

        {error && (
          <div
            style={{
              color: '#E63946',
              fontSize: 12,
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '11px 0',
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(135deg, #00AEFF, #5FC9FF)',
            color: '#071422',
            fontWeight: 700,
            fontSize: 13,
            cursor: loading ? 'wait' : 'pointer',
            fontFamily: 'inherit',
            marginBottom: 10,
          }}
        >
          {loading ? 'Signing in…' : 'Login'}
        </button>

        {isFirebaseClientConfigured && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
              <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,.08)' }}></div>
              <span style={{ fontSize: 9, color: 'rgba(240,237,229,.24)', padding: '0 10px', textTransform: 'uppercase', letterSpacing: '.1em' }}>or</span>
              <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,.08)' }}></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,.12)',
                background: 'rgba(255,255,255,.02)',
                color: '#F0EDE5',
                fontWeight: 600,
                fontSize: 13,
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </>
        )}

        <p
          style={{
            textAlign: 'center',
            fontSize: 10,
            color: 'rgba(240,237,229,.32)',
            marginTop: 16,
          }}
        >
          Staff only. Unauthorized access prohibited.
        </p>
      </form>
    </div>
  );
}
