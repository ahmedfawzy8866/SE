/**
 * Sierra Estates — Listings Page
 * File: SE/apps/client/src/app/listings/page.tsx
 *
 * Server Component with search params for filtering.
 */

import Link from 'next/link';
import { fetchActiveListings, formatPrice } from '@/lib/publicData';
import { BedDouble, Maximize, MapPin } from 'lucide-react';

interface SearchParams {
  mode?: string;
  compound?: string;
  type?: string;
  minBeds?: string;
  maxPrice?: string;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  let listings: Awaited<ReturnType<typeof fetchActiveListings>> = [];
  let loadError = false;

  try {
    listings = await fetchActiveListings({
      mode: params.mode === 'rent' ? 'rent' : params.mode === 'sale' ? 'sale' : undefined,
      compound: params.compound,
      propertyType: params.type,
      minBedrooms: params.minBeds ? parseInt(params.minBeds) : undefined,
      maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
      limitCount: 48,
    });
  } catch {
    loadError = true;
  }

  return (
    <>
      <section className="hero" style={{ padding: '48px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '36px' }}>Browse Listings</h1>
          <p>Filter by mode, compound, type, bedrooms, and budget.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Filter Bar */}
          <form className="filter-bar" method="GET">
            <select name="mode" defaultValue={params.mode || ''}>
              <option value="">All Modes</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
            <select name="type" defaultValue={params.type || ''}>
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="townhouse">Townhouse</option>
              <option value="penthouse">Penthouse</option>
              <option value="duplex">Duplex</option>
            </select>
            <input
              type="text"
              name="compound"
              placeholder="Compound name..."
              defaultValue={params.compound || ''}
            />
            <select name="minBeds" defaultValue={params.minBeds || ''}>
              <option value="">Any Beds</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
            <input
              type="number"
              name="maxPrice"
              placeholder="Max EGP"
              defaultValue={params.maxPrice || ''}
            />
            <button type="submit" className="btn btn-primary">
              Filter
            </button>
          </form>

          {/* Results count */}
          <p style={{ marginBottom: 24, color: '#5f7183', fontSize: 14 }}>
            {loadError ? '🔌 Firebase not connected' : `${listings.length} listing${listings.length !== 1 ? 's' : ''} found`}
          </p>

          {/* Grid */}
          {loadError ? (
            <div className="loading">
              <p>Set NEXT_PUBLIC_FIREBASE_* env vars to see live listings.</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="loading">
              <p>No listings match your filters. Try widening your search.</p>
            </div>
          ) : (
            <div className="listing-grid">
              {listings.map(listing => (
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
                      <span className={`type-badge ${listing.mode}`}>{listing.mode}</span>
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
    </>
  );
}
