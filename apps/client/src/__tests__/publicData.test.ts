/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  Sierra Estates — Client Portal Public Data Tests
 *  File: SE/apps/client/src/__tests__/publicData.test.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Tests the Zero-Trust security model:
 *    - fetchActiveListings ONLY returns status="active" listings
 *    - fetchActiveListingById returns null for non-active listings
 *    - submitInquiry writes to the public inquiries collection
 *    - No access to owners, clients, requests, agents
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ═══════════════════════════════════════════════════════════════════════════
//  MOCK FIREBASE
// ═══════════════════════════════════════════════════════════════════════════

const mockListings = new Map<string, any>();
const mockInquiriesAdded: any[] = [];

vi.mock('../lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((db, name) => ({ _collection: name })),
  query: vi.fn((colRef, ...constraints) => ({ _collection: colRef._collection, _constraints: constraints })),
  where: vi.fn((field, op, value) => ({ type: 'where', field, op, value })),
  orderBy: vi.fn((field, direction) => ({ type: 'orderBy', field, direction })),
  limit: vi.fn((n) => ({ type: 'limit', value: n })),
  getDocs: vi.fn(async (q) => {
    // Return only listings that match the query constraints
    let results = Array.from(mockListings.values());
    for (const c of q._constraints) {
      if (c.type === 'where' && c.op === '==') {
        results = results.filter(r => r[c.field] === c.value);
      }
      if (c.type === 'where' && c.op === '>=') {
        results = results.filter(r => r[c.field] >= c.value);
      }
      if (c.type === 'limit') {
        results = results.slice(0, c.value);
      }
    }
    return {
      docs: results.map(d => ({ id: d.id, data: () => d })),
      empty: results.length === 0,
    };
  }),
  getDoc: vi.fn(async (ref) => {
    const data = mockListings.get(ref.id);
    return { exists: () => !!data, id: ref.id, data: () => data };
  }),
  doc: vi.fn((db, collection, id) => ({ _collection: collection, id })),
  addDoc: vi.fn(async (colRef, data) => {
    const id = `inquiry-${Date.now()}`;
    mockInquiriesAdded.push({ id, ...data });
    return { id };
  }),
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
}));

// Mock env vars
vi.stubEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'test-api-key');
vi.stubEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'test-project');

const { fetchActiveListings, fetchActiveListingById, fetchFeaturedListings, submitInquiry, formatPrice } =
  await import('../lib/publicData');

/* ═══════════════════════════════════════════════════════════════════════════
 *  TESTS
 * ═══════════════════════════════════════════════════════════════════════════ */

beforeEach(() => {
  mockListings.clear();
  mockInquiriesAdded.length = 0;
  vi.clearAllMocks();
});

describe('Zero-Trust: fetchActiveListings', () => {
  it('ONLY returns listings with status="active"', async () => {
    mockListings.set('l1', { id: 'l1', status: 'active', compound_name: 'Mivida', created_at: { seconds: 1 } });
    mockListings.set('l2', { id: 'l2', status: 'draft', compound_name: 'Hidden', created_at: { seconds: 2 } });
    mockListings.set('l3', { id: 'l3', status: 'sold', compound_name: 'Sold', created_at: { seconds: 3 } });

    const result = await fetchActiveListings();
    expect(result).toHaveLength(1);
    expect(result[0].compound_name).toBe('Mivida');
  });

  it('applies where("status", "==", "active") constraint', async () => {
    mockListings.set('l1', { id: 'l1', status: 'active', created_at: { seconds: 1 } });
    await fetchActiveListings();
    const { where } = await import('firebase/firestore');
    expect(where).toHaveBeenCalledWith('status', '==', 'active');
  });

  it('filters by mode (sale/rent)', async () => {
    mockListings.set('l1', { id: 'l1', status: 'active', mode: 'sale', created_at: { seconds: 1 } });
    mockListings.set('l2', { id: 'l2', status: 'active', mode: 'rent', created_at: { seconds: 2 } });

    const saleOnly = await fetchActiveListings({ mode: 'sale' });
    expect(saleOnly).toHaveLength(1);
    expect(saleOnly[0].mode).toBe('sale');
  });

  it('filters by compound name', async () => {
    mockListings.set('l1', { id: 'l1', status: 'active', compound_name: 'Mivida', created_at: { seconds: 1 } });
    mockListings.set('l2', { id: 'l2', status: 'active', compound_name: 'Hyde Park', created_at: { seconds: 2 } });

    const result = await fetchActiveListings({ compound: 'Mivida' });
    expect(result).toHaveLength(1);
    expect(result[0].compound_name).toBe('Mivida');
  });

  it('applies client-side minBedrooms filter', async () => {
    mockListings.set('l1', { id: 'l1', status: 'active', bedrooms: 2, created_at: { seconds: 1 } });
    mockListings.set('l2', { id: 'l2', status: 'active', bedrooms: 4, created_at: { seconds: 2 } });

    const result = await fetchActiveListings({ minBedrooms: 3 });
    expect(result).toHaveLength(1);
    expect(result[0].bedrooms).toBe(4);
  });

  it('applies client-side maxPrice filter', async () => {
    mockListings.set('l1', { id: 'l1', status: 'active', price_egp: 5000000, created_at: { seconds: 1 } });
    mockListings.set('l2', { id: 'l2', status: 'active', price_egp: 20000000, created_at: { seconds: 2 } });

    const result = await fetchActiveListings({ maxPrice: 10000000 });
    expect(result).toHaveLength(1);
    expect(result[0].price_egp).toBe(5000000);
  });

  it('returns empty array when no active listings', async () => {
    const result = await fetchActiveListings();
    expect(result).toEqual([]);
  });

  it('respects limitCount (default 24)', async () => {
    const { limit } = await import('firebase/firestore');
    mockListings.set('l1', { id: 'l1', status: 'active', created_at: { seconds: 1 } });
    await fetchActiveListings();
    expect(limit).toHaveBeenCalledWith(24);
  });

  it('respects custom limitCount', async () => {
    const { limit } = await import('firebase/firestore');
    mockListings.set('l1', { id: 'l1', status: 'active', created_at: { seconds: 1 } });
    await fetchActiveListings({ limitCount: 6 });
    expect(limit).toHaveBeenCalledWith(6);
  });
});

describe('Zero-Trust: fetchActiveListingById', () => {
  it('returns listing if status is active', async () => {
    mockListings.set('l1', { id: 'l1', status: 'active', compound_name: 'Mivida' });
    const result = await fetchActiveListingById('l1');
    expect(result).not.toBeNull();
    expect(result!.compound_name).toBe('Mivida');
  });

  it('returns null for draft listings (security: non-active hidden)', async () => {
    mockListings.set('l1', { id: 'l1', status: 'draft', compound_name: 'Secret' });
    const result = await fetchActiveListingById('l1');
    expect(result).toBeNull();
  });

  it('returns null for sold listings (security: non-active hidden)', async () => {
    mockListings.set('l1', { id: 'l1', status: 'sold', compound_name: 'Sold' });
    const result = await fetchActiveListingById('l1');
    expect(result).toBeNull();
  });

  it('returns null for non-existent listing', async () => {
    const result = await fetchActiveListingById('nonexistent');
    expect(result).toBeNull();
  });
});

describe('Zero-Trust: fetchFeaturedListings', () => {
  it('orders by ai_score descending', async () => {
    const { where, orderBy, limit } = await import('firebase/firestore');
    mockListings.set('l1', { id: 'l1', status: 'active', ai_score: 9.5, created_at: { seconds: 1 } });
    await fetchFeaturedListings(6);
    expect(where).toHaveBeenCalledWith('status', '==', 'active');
    expect(orderBy).toHaveBeenCalledWith('ai_score', 'desc');
    expect(limit).toHaveBeenCalledWith(6);
  });

  it('default count is 6', async () => {
    const { limit } = await import('firebase/firestore');
    mockListings.set('l1', { id: 'l1', status: 'active', ai_score: 9, created_at: { seconds: 1 } });
    await fetchFeaturedListings();
    expect(limit).toHaveBeenCalledWith(6);
  });
});

describe('submitInquiry (public write)', () => {
  it('writes to the inquiries collection', async () => {
    const { addDoc, collection } = await import('firebase/firestore');
    await submitInquiry({
      name: 'Test User',
      phone: '+201001234567',
      message: 'I want this property',
    });
    expect(collection).toHaveBeenCalledWith({}, 'inquiries');
    expect(addDoc).toHaveBeenCalled();
  });

  it('sets status="new" and source="website"', async () => {
    const { addDoc } = await import('firebase/firestore');
    await submitInquiry({
      name: 'Test',
      phone: '+201000000000',
      message: 'Hello',
    });
    const dataArg = addDoc.mock.calls[0][1];
    expect(dataArg.status).toBe('new');
    expect(dataArg.source).toBe('website');
  });

  it('includes serverTimestamp for created_at', async () => {
    const { addDoc, serverTimestamp } = await import('firebase/firestore');
    await submitInquiry({
      name: 'Test',
      phone: '+201000000000',
      message: 'Hello',
    });
    const dataArg = addDoc.mock.calls[0][1];
    expect(dataArg.created_at).toBeDefined();
    expect(serverTimestamp).toHaveBeenCalled();
  });

  it('includes optional listing_id + compound', async () => {
    const { addDoc } = await import('firebase/firestore');
    await submitInquiry({
      name: 'Test',
      phone: '+201000000000',
      message: 'Interested',
      listing_id: 'listing-123',
      compound: 'Mivida',
    });
    const dataArg = addDoc.mock.calls[0][1];
    expect(dataArg.listing_id).toBe('listing-123');
    expect(dataArg.compound).toBe('Mivida');
  });

  it('returns the new inquiry ID', async () => {
    const result = await submitInquiry({
      name: 'Test',
      phone: '+201000000000',
      message: 'Hello',
    });
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
  });
});

describe('formatPrice helper', () => {
  it('formats sale price with EGP prefix', () => {
    const result = formatPrice(25000000, 'sale');
    expect(result).toBe('EGP 25,000,000');
  });

  it('formats rent price with /mo suffix', () => {
    const result = formatPrice(15000, 'rent');
    expect(result).toBe('EGP 15,000/mo');
  });

  it('handles zero price', () => {
    expect(formatPrice(0, 'sale')).toBe('EGP 0');
  });

  it('handles large numbers', () => {
    expect(formatPrice(1000000000, 'sale')).toBe('EGP 1,000,000,000');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
 *  SECURITY VERIFICATION: no access to private collections
 * ═══════════════════════════════════════════════════════════════════════════ */

describe('Zero-Trust security verification', () => {
  it('publicData module does NOT export owners access', async () => {
    const module = await import('../lib/publicData');
    expect(module).not.toHaveProperty('fetchOwners');
    expect(module).not.toHaveProperty('fetchOwnerByListingId');
  });

  it('publicData module does NOT export clients access', async () => {
    const module = await import('../lib/publicData');
    expect(module).not.toHaveProperty('fetchClients');
    expect(module).not.toHaveProperty('createClient');
  });

  it('publicData module does NOT export requests access', async () => {
    const module = await import('../lib/publicData');
    expect(module).not.toHaveProperty('fetchRequests');
    expect(module).not.toHaveProperty('createRequest');
  });

  it('publicData module does NOT export agents access', async () => {
    const module = await import('../lib/publicData');
    expect(module).not.toHaveProperty('fetchAgents');
    expect(module).not.toHaveProperty('createAgent');
  });
});
