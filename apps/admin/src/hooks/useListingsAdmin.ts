/**
 * Admin Dashboard - Listings Management Hook
 * SIERRA ESTATES 3.0 — Intelligence OS
 */

import { useEffect, useState } from 'react';
import { useAdminFirestore } from '../providers/FirebaseProvider';
import { getFirestoreService } from '@sierra-estates/db/firestore.service';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import type { FirestoreListing } from '@sierra-estates/types';

interface UseListingsAdminResult {
  listings: FirestoreListing[];
  loading: boolean;
  error: Error | null;
  createListing: (data: Partial<FirestoreListing>) => Promise<string>;
  updateListing: (id: string, updates: Partial<FirestoreListing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  searchListings: (query: string) => Promise<FirestoreListing[]>;
}

export function useListingsAdmin(): UseListingsAdminResult {
  const db = useAdminFirestore();
  const [listings, setListings] = useState<FirestoreListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) return;

    setLoading(true);

    try {
      const firestoreService = getFirestoreService();
      const unsubscribe = firestoreService.onQueryChange<FirestoreListing>(
        'houyez_listings',
        [],
        (listings) => {
          setListings(listings);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
    }
  }, [db]);

  const createListing = async (data: Partial<FirestoreListing>): Promise<string> => {
    try {
      const firestoreService = getFirestoreService();
      const listing: Partial<FirestoreListing> = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await firestoreService.addDocument<FirestoreListing>(
        'houyez_listings',
        listing
      );

      return docRef.id;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  };

  const updateListing = async (id: string, updates: Partial<FirestoreListing>) => {
    try {
      const firestoreService = getFirestoreService();
      await firestoreService.updateDocument('houyez_listings', id, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  };

  const deleteListing = async (id: string) => {
    try {
      const firestoreService = getFirestoreService();
      await firestoreService.deleteDocument('houyez_listings', id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  };

  const searchListings = async (searchQuery: string): Promise<FirestoreListing[]> => {
    try {
      // Simple client-side search for now
      return listings.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  };

  return {
    listings,
    loading,
    error,
    createListing,
    updateListing,
    deleteListing,
    searchListings,
  };
}
