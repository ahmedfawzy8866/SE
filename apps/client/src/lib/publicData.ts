/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  Sierra Estates — Client Portal Public Data Layer
 *  File: SE/apps/client/src/lib/publicData.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Read-only access to PUBLIC listings (status="active" only).
 *  Write access only to the "inquiries" collection (public create).
 *
 *  🔒 Security enforced by Firestore rules — even if this code is modified
 *     client-side, the database will reject any attempt to read private
 *     collections (owners, clients, requests, agents).
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
  collection, query, where, orderBy, limit, getDocs, getDoc, doc,
  addDoc, serverTimestamp, QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type { PublicListing } from '@sierra-estates/types';

/* ──────────────────────────────────────────────────────────────────────────
 *  LISTINGS (public read — active only)
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Fetch active listings for the public portal.
 * Optional filters: mode (sale/rent), compound, property_type, min_bedrooms, max_price.
 */
export async function fetchActiveListings(opts?: {
  mode?: 'sale' | 'rent';
  compound?: string;
  propertyType?: string;
  minBedrooms?: number;
  maxPrice?: number;
  limitCount?: number;
}): Promise<PublicListing[]> {
  const constraints: QueryConstraint[] = [
    where('status', '==', 'active'),
    orderBy('created_at', 'desc'),
  ];

  if (opts?.mode) constraints.push(where('mode', '==', opts.mode));
  if (opts?.compound) constraints.push(where('compound_name', '==', opts.compound));
  if (opts?.propertyType) constraints.push(where('property_type', '==', opts.propertyType));
  constraints.push(limit(opts?.limitCount ?? 24));

  const q = query(collection(db, 'listings'), ...constraints);
  const snap = await getDocs(q);

  let results = snap.docs.map(d => ({ id: d.id, ...d.data() }) as PublicListing);

  // Client-side filters (can't use multiple range filters in Firestore)
  if (opts?.minBedrooms) results = results.filter(l => l.bedrooms >= opts.minBedrooms!);
  if (opts?.maxPrice) results = results.filter(l => l.price_egp <= opts.maxPrice!);

  return results;
}

/**
 * Fetch a single active listing by ID (public detail page).
 * Returns null if not found OR if status !== "active".
 */
export async function fetchActiveListingById(id: string): Promise<PublicListing | null> {
  const snap = await getDoc(doc(db, 'listings', id));
  if (!snap.exists()) return null;
  const listing = { id: snap.id, ...snap.data() } as PublicListing;
  // Security: only return active listings to the public
  if (listing.status !== 'active') return null;
  return listing;
}

/**
 * Fetch featured listings (highest AI score, active).
 * Used on the homepage hero section.
 */
export async function fetchFeaturedListings(count = 6): Promise<PublicListing[]> {
  const q = query(
    collection(db, 'listings'),
    where('status', '==', 'active'),
    orderBy('ai_score', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as PublicListing);
}

/* ──────────────────────────────────────────────────────────────────────────
 *  INQUIRIES (public create — write-only from client)
 * ────────────────────────────────────────────────────────────────────────── */

export interface InquiryInput {
  name: string;
  phone: string;
  email?: string;
  message: string;
  listing_id?: string;
  compound?: string;
}

/**
 * Submit a public inquiry. Writes to the "inquiries" collection.
 * Firestore rules allow public create but admin-only read.
 */
export async function submitInquiry(data: InquiryInput): Promise<{ id: string }> {
  const ref = await addDoc(collection(db, 'inquiries'), {
    ...data,
    status: 'new',
    source: 'website',
    created_at: serverTimestamp(),
  });
  return { id: ref.id };
}

/* ──────────────────────────────────────────────────────────────────────────
 *  HELPER: Format price in EGP
 * ────────────────────────────────────────────────────────────────────────── */

export function formatPrice(priceEgp: number, mode: 'sale' | 'rent'): string {
  const formatted = new Intl.NumberFormat('en-US').format(priceEgp);
  return mode === 'rent' ? `EGP ${formatted}/mo` : `EGP ${formatted}`;
}
