/**
 * Houyez-Style Portal — Firestore data layer
 * ────────────────────────────────────────────────────────────────────────────
 * Migrated from Sierra-Estates-Final's lib/houyez/firestore.ts.
 *
 * Five collections power the portal:
 *   houyez_slides     → hero slider
 *   houyez_compounds  → compounds grid
 *   houyez_rooms      → 360° rooms strip
 *   houyez_listings   → AI-curated listings grid
 *   houyez_tours      → 3D virtual tour player
 *
 * All collections support:
 *   - Real-time onSnapshot subscriptions
 *   - Soft-delete via the `active` boolean (listings + tours)
 *   - Order via the `order` field (ascending)
 *   - Static seed fallback when Firebase isn't configured or collection is empty
 *
 * Write helpers:
 *   - seedHouyezPortal({ overwrite }) — idempotent seed from data/houyez-properties.ts
 *   - upsertHouyezDoc(col, data, id?) — admin write helper
 */

import {
  collection, query, orderBy, onSnapshot, where,
  addDoc, setDoc, doc, getDocs, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseClientConfigured } from '@/lib/firebase';
import {
  HOUEZ_SLIDES, HOUEZ_COMPOUNDS, HOUEZ_ROOMS, HOUEZ_LISTINGS, HOUEZ_TOURS,
  type HouyezSlide, type HouyezCompound, type HouyezRoom, type HouyezListing, type HouyezTour,
} from '@/data/houyez-properties';

export const HOUEZ_COLLECTIONS = {
  slides: 'houyez_slides',
  compounds: 'houyez_compounds',
  rooms: 'houyez_rooms',
  listings: 'houyez_listings',
  tours: 'houyez_tours',
} as const;

// ─── Generic subscription helper (with seed fallback) ───────────────────────
function subscribe<T>(
  colName: string,
  seed: T[],
  onData: (rows: T[]) => void,
  onError?: (err: Error) => void,
): () => void {
  if (!isFirebaseClientConfigured) {
    onData(seed);
    return () => {};
  }
  try {
    const q = query(collection(db, colName), orderBy('order', 'asc'));
    return onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          onData(seed);
          return;
        }
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as unknown as T);
        onData(rows);
      },
      (err) => {
         
        console.warn(`[houyez] ${colName} subscription failed, using seed:`, err.message);
        onData(seed);
        onError?.(err as Error);
      },
    );
  } catch (err) {
     
    console.warn(`[houyez] ${colName} subscription setup failed, using seed:`, err);
    onData(seed);
    return () => {};
  }
}

// ─── Per-collection subscriptions ───────────────────────────────────────────
export function subscribeHouyezSlides(cb: (rows: HouyezSlide[]) => void, onErr?: (e: Error) => void) {
  return subscribe<HouyezSlide>(HOUEZ_COLLECTIONS.slides, HOUEZ_SLIDES, cb, onErr);
}
export function subscribeHouyezCompounds(cb: (rows: HouyezCompound[]) => void, onErr?: (e: Error) => void) {
  return subscribe<HouyezCompound>(HOUEZ_COLLECTIONS.compounds, HOUEZ_COMPOUNDS, cb, onErr);
}
export function subscribeHouyezRooms(cb: (rows: HouyezRoom[]) => void, onErr?: (e: Error) => void) {
  return subscribe<HouyezRoom>(HOUEZ_COLLECTIONS.rooms, HOUEZ_ROOMS, cb, onErr);
}

export function subscribeHouyezListings(cb: (rows: HouyezListing[]) => void, onErr?: (e: Error) => void) {
  if (!isFirebaseClientConfigured) {
    cb(HOUEZ_LISTINGS);
    return () => {};
  }
  try {
    const q = query(
      collection(db, HOUEZ_COLLECTIONS.listings),
      where('active', '==', true),
      orderBy('order', 'asc'),
    );
    return onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          cb(HOUEZ_LISTINGS);
          return;
        }
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as unknown as HouyezListing);
        cb(rows);
      },
      (err) => {
         
        console.warn('[houyez] listings subscription failed, using seed:', err.message);
        cb(HOUEZ_LISTINGS);
        onErr?.(err as Error);
      },
    );
  } catch (err) {
     
    console.warn('[houyez] listings subscription setup failed, using seed:', err);
    cb(HOUEZ_LISTINGS);
    return () => {};
  }
}

export function subscribeHouyezTours(cb: (rows: HouyezTour[]) => void, onErr?: (e: Error) => void) {
  if (!isFirebaseClientConfigured) {
    cb(HOUEZ_TOURS);
    return () => {};
  }
  try {
    const q = query(
      collection(db, HOUEZ_COLLECTIONS.tours),
      where('active', '==', true),
      orderBy('order', 'asc'),
    );
    return onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          cb(HOUEZ_TOURS);
          return;
        }
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as unknown as HouyezTour);
        cb(rows);
      },
      (err) => {
         
        console.warn('[houyez] tours subscription failed, using seed:', err.message);
        cb(HOUEZ_TOURS);
        onErr?.(err as Error);
      },
    );
  } catch (err) {
     
    console.warn('[houyez] tours subscription setup failed, using seed:', err);
    cb(HOUEZ_TOURS);
    return () => {};
  }
}

// ─── Seed helper ────────────────────────────────────────────────────────────
/**
 * Seed all five Houyez collections from the static data file.
 *
 * Idempotent: skips collections that already have docs unless `overwrite: true`.
 * Returns a per-collection summary.
 */
export async function seedHouyezPortal(opts: { overwrite?: boolean } = {}): Promise<{
  slides: number; compounds: number; rooms: number; listings: number; tours: number;
  skipped: string[];
  errors: string[];
}> {
  const result = {
    slides: 0, compounds: 0, rooms: 0, listings: 0, tours: 0,
    skipped: [] as string[],
    errors: [] as string[],
  };

  if (!isFirebaseClientConfigured) {
    result.errors.push('Firebase client not configured — set NEXT_PUBLIC_FIREBASE_* env vars.');
    return result;
  }

  const collectionsToSeed: Array<{
    name: string;
    rows: Array<Record<string, unknown>>;
    counterKey: 'slides' | 'compounds' | 'rooms' | 'listings' | 'tours';
  }> = [
    {
      name: HOUEZ_COLLECTIONS.slides,
      counterKey: 'slides',
      rows: HOUEZ_SLIDES.map((s, i) => ({ ...s, order: i, createdAt: serverTimestamp() })),
    },
    {
      name: HOUEZ_COLLECTIONS.compounds,
      counterKey: 'compounds',
      rows: HOUEZ_COMPOUNDS.map((c, i) => ({ ...c, order: i, createdAt: serverTimestamp() })),
    },
    {
      name: HOUEZ_COLLECTIONS.rooms,
      counterKey: 'rooms',
      rows: HOUEZ_ROOMS.map((r, i) => ({ ...r, order: i, createdAt: serverTimestamp() })),
    },
    {
      name: HOUEZ_COLLECTIONS.listings,
      counterKey: 'listings',
      rows: HOUEZ_LISTINGS.map((l, i) => ({ ...l, order: i, active: true, createdAt: serverTimestamp() })),
    },
    {
      name: HOUEZ_COLLECTIONS.tours,
      counterKey: 'tours',
      rows: HOUEZ_TOURS.map((t, i) => ({ ...t, order: i, active: true, createdAt: serverTimestamp() })),
    },
  ];

  for (const { name, rows, counterKey } of collectionsToSeed) {
    try {
      const existing = await getDocs(collection(db, name));
      if (!opts.overwrite && !existing.empty) {
        result.skipped.push(`${name} (already has ${existing.size} docs)`);
        continue;
      }
      if (opts.overwrite && !existing.empty) {
        const batch = writeBatch(db);
        existing.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      for (const row of rows) {
        await addDoc(collection(db, name), row);
        result[counterKey]++;
      }
    } catch (err) {
      result.errors.push(`${name}: ${(err as Error).message}`);
    }
  }
  return result;
}

// ─── Upsert helper (admin use) ──────────────────────────────────────────────
/**
 * Upsert a single Houyez doc. Pass an explicit `id` to update an existing doc;
 * omit it to create a new one with an auto-id.
 */
export async function upsertHouyezDoc(
  col: keyof typeof HOUEZ_COLLECTIONS,
  data: Record<string, unknown>,
  id?: string,
): Promise<{ id: string; created: boolean }> {
  if (!isFirebaseClientConfigured) {
    throw new Error('Firebase client not configured.');
  }
  const colName = HOUEZ_COLLECTIONS[col];
  if (id) {
    await setDoc(doc(db, colName, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
    return { id, created: false };
  }
  const ref = await addDoc(collection(db, colName), { ...data, createdAt: serverTimestamp() });
  return { id: ref.id, created: true };
}
