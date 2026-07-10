/**
 * Sierra Estates — Homepage
 * File: SE/apps/client/src/app/page.tsx
 *
 * Server Component — fetches featured listings from Firestore on the server.
 */

import Link from 'next/link';
import { fetchFeaturedListings, formatPrice } from '@/lib/publicData';
import { Building2, BedDouble, Maximize, MapPin } from 'lucide-react';

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof fetchFeaturedListings>> = [];
  let loadError = false;

  try {
    featured = await fetchFeaturedListings(6);
  } catch {
    // Firestore not configured or unreachable — render with empty state
    loadError = true;
  }

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>
            Find Your Dream Home in <em>New Cairo</em>
          </h1>
          <p>
            AI-driven real estate portal with 1,900+ verified listings across 50+ compounds.
            Browse, tour, and get AI-matched properties in seconds.
          </p>
          <Link href="/listings" className="btn btn-primary">
            Browse Listings
          </Link>
          <div className="hero-stats">
            <div className="hero-stat">
              <b>1,900+</b>
              <span>Active Listings</span>
            </div>
            <div className="hero-stat">
              <b>50+</b>
              <span>Compounds</span>
            </div>
            <div className="hero-stat">
              <b>4.2B</b>
              <span>EGP Closed 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="section">
        <div className="container">
          <h2>Featured Properties</h2>
          <p className="subtitle">
            AI-ranked top listings across New Cairo — updated in real-time.
          </p>

          {loadError ? (
            <div className="loading">
              <p>🔌 Connect Firebase to see live listings. (Set NEXT_PUBLIC_FIREBASE_* env vars)</p>
            </div>
          ) : featured.length === 0 ? (
            <div className="loading">
              <p>No active listings yet. Add some from the Admin SPA.</p>
            </div>
          ) : (
            <div className="listing-grid">
              {featured.map(listing => (
                <Link href={`/listings/${listing.id}`} key={listing.id} className="listing-card">
                  {listing.cover_image_url && (
                    <img src={listing.cover_image_url} alt={listing.compound_name} />
                  )}
                  <div className="listing-body">
                    <div className="compound">{listing.compound_name}</div>
                    <h3>
                      {listing.bedrooms} Bed {listing.property_type.replace('_', ' ')}
                    </h3>
                    <div className="specs">
                      <span className="type-badge {listing.mode}">{listing.mode}</span>
                      <span>
                        <BedDouble size={13} /> {listing.bedrooms} beds
                      </span>
                      <span>
                        <Maximize size={13} /> {listing.area_sqm} m²
                      </span>
                      <span>
                        <MapPin size={13} /> {listing.location_sector}
                      </span>
                    </div>
                    <div className="price">{formatPrice(listing.price_egp, listing.mode)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Can&apos;t find what you&apos;re looking for?</h2>
          <p className="subtitle">
            Our AI assistant will match you to the perfect property based on your needs.
          </p>
          <Link href="/inquire" className="btn btn-primary">
            Get AI Matched
          </Link>
        </div>
      </section>
    </>
  );
}
