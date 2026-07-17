/**
 * Admin Dashboard - Firebase Initialization
 * SIERRA ESTATES 3.0 — Intelligence OS
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { firebaseConfig } from '@sierra-estates/config';
import { initializeFirestoreService } from '@sierra-estates/db/firestore.service';

export let adminFirebaseApp: ReturnType<typeof initializeApp> | null = null;
export let adminAuth: Auth | null = null;
export let adminDb: Firestore | null = null;

/**
 * Initialize Firebase for Admin Dashboard
 */
export async function initializeAdminFirebase() {
  // Return existing instance
  if (getApps().length > 0) {
    adminFirebaseApp = getApps()[0];
    adminAuth = getAuth(adminFirebaseApp);
    adminDb = getFirestore(adminFirebaseApp);
    initializeFirestoreService(adminDb);
    return { app: adminFirebaseApp, auth: adminAuth, db: adminDb };
  }

  // Initialize Firebase
  adminFirebaseApp = initializeApp(firebaseConfig);
  adminAuth = getAuth(adminFirebaseApp);
  adminDb = getFirestore(adminFirebaseApp);

  // Initialize Firestore service
  initializeFirestoreService(adminDb);

  // Connect to emulator in development
  if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_EMULATOR === 'true') {
    try {
      connectFirestoreEmulator(adminDb, 'localhost', 8080);
      console.log('Connected to Firestore emulator');
    } catch (err) {
      console.warn('Emulator connection error:', err);
    }
  }

  console.log('Admin Firebase initialized');

  return { app: adminFirebaseApp, auth: adminAuth, db: adminDb };
}

export function getAdminFirebaseServices() {
  if (!adminDb || !adminAuth) {
    throw new Error('Firebase not initialized. Call initializeAdminFirebase() first.');
  }
  return { app: adminFirebaseApp, auth: adminAuth, db: adminDb };
}
