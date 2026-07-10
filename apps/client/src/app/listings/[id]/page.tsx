/**
 * Sierra Estates — Listing Detail Page
 * File: SE/apps/client/src/app/listings/[id]/page.tsx
 *
 * Server Component — fetches a single active listing.
 * Returns 404 if listing doesn't exist or isn't active.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchActiveListingById, formatPrice } from '@/lib/publicData';
import { BedDouble, Maximize, MapPin, Bath, CheckCircle, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  let listing;
  try {
    listing = await fetchActiveListingById(id);
  } catch {
    notFound();
  }
  if (!listing) notFound();

  return (
    <>
      {/* Back link */}
      <div className="container" style={{ padding: '24px 24px 0' }}>
        <Link
          href="/listings"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#00aeff', fontSize: 14, fontWeight: 600 }}
        >
          <ArrowLeft size={16} /> Back to Listings
        </Link>
      </div>

      {/* Hero image */}
      {listing.cover_image_url && (
        <div style={{ maxWidth: 1200, margin: '24px auto', padding: '0 24px' }}>
          <img
            src={listing.cover_image_url}
            alt={listing.compound_name}
            style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 16 }}
          />
        </div>
      )}

      <div className="container" style={{ paddingBottom: 64 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: '#00aeff', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            {listing.compound_name} · {listing.location_sector}
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            {listing.bedrooms} Bedroom {listing.property_type.replace('_', ' ')}
          </h1>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#002b4b', fontFamily: 'monospace', marginBottom: 16 }}>
            {formatPrice(listing.price_egp, listing.mode)}
          </div>
          <span className={`type-badge ${listing.mode}`} style={{ fontSize: 13, padding: '5px 14px' }}>
            For {listing.mode}
          </span>
        </div>

        {/* Specs grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
          <SpecCard icon={BedDouble} label="Bedrooms" value={listing.bedrooms.toString()} />
          <SpecCard icon={Bath} label="Bathrooms" value={(listing.bathrooms || '—').toString()} />
          <SpecCard icon={Maximize} label="Area" value={`${listing.area_sqm} m²`} />
          <SpecCard icon={MapPin} label="Sector" value={listing.location_sector} />
          <SpecCard icon={CheckCircle} label="Finishing" value={listing.finishing.replace('_', ' ')} />
          <SpecCard icon={CheckCircle} label="Delivery" value={listing.delivery_status.replace('_', ' ')} />
        </div>

        {/* Payment plan */}
        {listing.payment_plan && (
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, marginBottom: 24, border: '1px solid #e7ebee' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Payment Plan</h3>
            <p style={{ color: '#5f7183' }}>{listing.payment_plan}</p>
          </div>
        )}

        {/* Virtual tour */}
        {listing.virtual_tour_url && (
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, marginBottom: 24, border: '1px solid #e7ebee' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>3D Virtual Tour</h3>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 8, overflow: 'hidden' }}>
              <iframe
                src={listing.virtual_tour_url}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                allowFullScreen
                title="3D Virtual Tour"
              />
            </div>
          </div>
        )}

        {/* AI score */}
        {listing.ai_score && (
          <div style={{ background: 'linear-gradient(135deg, #002b4b, #0a1622)', color: '#fff', padding: 24, borderRadius: 12, marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#00aeff', marginBottom: 8 }}>
              AI Match Score
            </div>
            <div style={{ fontSize: 36, fontWeight: 800 }}>{listing.ai_score} / 10</div>
            <p style={{ opacity: 0.7, fontSize: 14, marginTop: 8 }}>
              This listing is ranked by our AI based on ROI potential, market demand, and location growth.
            </p>
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link
            href={`/inquire?listing_id=${listing.id}&compound=${encodeURIComponent(listing.compound_name)}`}
            className="btn btn-primary"
            style={{ fontSize: 16, padding: '16px 40px' }}
          >
            Inquire About This Property
          </Link>
        </div>
      </div>
    </>
  );
}

function SpecCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e7ebee', textAlign: 'center' }}>
      <Icon size={24} style={{ color: '#00aeff', margin: '0 auto 8px' }} />
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9aa4ad', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, textTransform: 'capitalize' }}>{value}</div>
    </div>
  );
}
