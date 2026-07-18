'use client';

/**
 * useHouyezPortal — React hook that subscribes to all five Houyez collections.
 * ────────────────────────────────────────────────────────────────────────────
 * Migrated from Sierra-Estates-Final's lib/houyez/useHouyezPortal.ts.
 *
 * Returns live data for the Houyez-Style Portal. Whenever an admin edits a
 * doc in Firestore (via Firebase Console, the admin portal, or any other
 * client), the portal re-renders automatically — no refresh, no redeploy.
 *
 * SSR-safe: returns seed data on the server (so the page renders correctly
 * during build / first paint) and swaps to live Firestore data once mounted
 * on the client.
 */

import { useEffect, useState } from 'react';
import {
  subscribeHouyezSlides, subscribeHouyezCompounds, subscribeHouyezRooms,
  subscribeHouyezListings, subscribeHouyezTours,
} from './firestore';
import {
  HOUEZ_SLIDES, HOUEZ_COMPOUNDS, HOUEZ_ROOMS, HOUEZ_LISTINGS, HOUEZ_TOURS,
  type HouyezSlide, type HouyezCompound, type HouyezRoom, type HouyezListing, type HouyezTour,
} from '@/data/houyez-properties';

export interface UseHouyezPortalResult {
  slides: HouyezSlide[];
  compounds: HouyezCompound[];
  rooms: HouyezRoom[];
  listings: HouyezListing[];
  tours: HouyezTour[];
  loading: boolean;
  error: string | null;
  usingSeed: boolean;
}

export function useHouyezPortal(): UseHouyezPortalResult {
  // Seed-first: render immediately with seed data so SSR + first paint is
  // never empty. The subscriptions replace these once Firestore responds.
  const [slides, setSlides] = useState<HouyezSlide[]>(HOUEZ_SLIDES);
  const [compounds, setCompounds] = useState<HouyezCompound[]>(HOUEZ_COMPOUNDS);
  const [rooms, setRooms] = useState<HouyezRoom[]>(HOUEZ_ROOMS);
  const [listings, setListings] = useState<HouyezListing[]>(HOUEZ_LISTINGS);
  const [tours, setTours] = useState<HouyezTour[]>(HOUEZ_TOURS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSeed, setUsingSeed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const onFirstData = () => {
      if (mounted) setLoading(false);
    };

    const unsubs = [
      subscribeHouyezSlides((rows) => {
        if (!mounted) return;
        if (rows === HOUEZ_SLIDES) setUsingSeed(true);
        setSlides(rows);
        onFirstData();
      }, (e) => { if (mounted) setError(e.message); }),
      subscribeHouyezCompounds((rows) => {
        if (!mounted) return;
        if (rows === HOUEZ_COMPOUNDS) setUsingSeed(true);
        setCompounds(rows);
        onFirstData();
      }, (e) => { if (mounted) setError(e.message); }),
      subscribeHouyezRooms((rows) => {
        if (!mounted) return;
        if (rows === HOUEZ_ROOMS) setUsingSeed(true);
        setRooms(rows);
        onFirstData();
      }, (e) => { if (mounted) setError(e.message); }),
      subscribeHouyezListings((rows) => {
        if (!mounted) return;
        if (rows === HOUEZ_LISTINGS) setUsingSeed(true);
        setListings(rows);
        onFirstData();
      }, (e) => { if (mounted) setError(e.message); }),
      subscribeHouyezTours((rows) => {
        if (!mounted) return;
        if (rows === HOUEZ_TOURS) setUsingSeed(true);
        setTours(rows);
        onFirstData();
      }, (e) => { if (mounted) setError(e.message); }),
    ];

    // Safety: never leave the page in loading state forever.
    const t = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(t);
      unsubs.forEach((u) => {
        try { u(); } catch { /* ignore */ }
      });
    };
  }, []);

  return { slides, compounds, rooms, listings, tours, loading, error, usingSeed };
}
