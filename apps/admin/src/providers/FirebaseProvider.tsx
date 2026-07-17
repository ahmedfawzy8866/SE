/**
 * Admin Dashboard - Firebase Provider
 * SIERRA ESTATES 3.0 — Intelligence OS
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeAdminFirebase, getAdminFirebaseServices } from '../firebase-init';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseContextType {
  auth: Auth | null;
  db: Firestore | null;
  isInitialized: boolean;
  error: Error | null;
}

export const AdminFirebaseContext = createContext<FirebaseContextType>({
  auth: null,
  db: null,
  isInitialized: false,
  error: null,
});

export function AdminFirebaseProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const { auth: authService, db: dbService } = await initializeAdminFirebase();
        setAuth(authService);
        setDb(dbService);
        setIsInitialized(true);
        console.log('✅ Admin Firebase initialized');
      } catch (err) {
        const firebaseError = err instanceof Error ? err : new Error(String(err));
        setError(firebaseError);
        console.error('❌ Firebase initialization error:', firebaseError);
      }
    }

    init();
  }, []);

  return (
    <AdminFirebaseContext.Provider value={{ auth, db, isInitialized, error }}>
      {children}
    </AdminFirebaseContext.Provider>
  );
}

export function useAdminFirebase() {
  const context = useContext(AdminFirebaseContext);
  if (!context) {
    throw new Error('useAdminFirebase must be used within AdminFirebaseProvider');
  }
  return context;
}

export function useAdminAuth() {
  const { auth } = useAdminFirebase();
  if (!auth) throw new Error('Auth not initialized');
  return auth;
}

export function useAdminFirestore() {
  const { db } = useAdminFirebase();
  if (!db) throw new Error('Firestore not initialized');
  return db;
}
