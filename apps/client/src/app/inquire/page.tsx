'use client';

/**
 * Sierra Estates — Inquiry Page
 * File: SE/apps/client/src/app/inquire/page.tsx
 *
 * Client Component — handles form submission to Firestore "inquiries" collection.
 * Pre-fills listing_id + compound if provided in URL params.
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { submitInquiry } from '@/lib/publicData';
import { Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

// useSearchParams() must be inside a Suspense boundary for static prerender.
export default function InquirePage() {
  return (
    <Suspense fallback={null}>
      <InquireForm />
    </Suspense>
  );
}

function InquireForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listingId = searchParams.get('listing_id') || undefined;
  const compound = searchParams.get('compound') || undefined;

  // Pre-fill message if coming from a listing page
  useEffect(() => {
    if (compound) {
      setMessage(`I'm interested in a property at ${compound}. Please contact me with more details.`);
    }
  }, [compound]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await submitInquiry({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        message: message.trim(),
        listing_id: listingId,
        compound,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
          <CheckCircle size={64} style={{ color: '#34d399', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Inquiry Submitted!</h1>
          <p style={{ color: '#5f7183', marginBottom: 32 }}>
            Thank you, {name}. Our team will contact you at {phone} within 24 hours.
          </p>
          <button onClick={() => router.push('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="hero" style={{ padding: '48px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '36px' }}>Inquire Now</h1>
          <p>Fill out the form and our team will get back to you within 24 hours.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 600 }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: 12,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                marginBottom: 16,
                color: '#dc2626',
                fontSize: 14,
              }}
            >
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {compound && (
            <div
              style={{
                padding: 12,
                background: '#e9f8ff',
                border: '1px solid #b3e0ff',
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 14,
                color: '#00aeff',
                fontWeight: 600,
              }}
            >
              📍 Inquiring about: {compound}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ background: '#fff', padding: 32, borderRadius: 16, border: '1px solid #e7ebee' }}
          >
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5f7183', marginBottom: 6 }}>
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #dce0e0',
                  borderRadius: 8,
                  fontSize: 15,
                  outline: 'none',
                }}
                placeholder="Your full name"
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5f7183', marginBottom: 6 }}>
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                dir="ltr"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #dce0e0',
                  borderRadius: 8,
                  fontSize: 15,
                  outline: 'none',
                }}
                placeholder="+20 1XX XXX XXXX"
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5f7183', marginBottom: 6 }}>
                Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                dir="ltr"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #dce0e0',
                  borderRadius: 8,
                  fontSize: 15,
                  outline: 'none',
                }}
                placeholder="you@example.com"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5f7183', marginBottom: 6 }}>
                Message
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #dce0e0',
                  borderRadius: 8,
                  fontSize: 15,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
                placeholder="Tell us what you're looking for..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '14px' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send size={18} /> Submit Inquiry
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
