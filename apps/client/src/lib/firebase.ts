/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  Sierra Estates — Client Portal Firebase Config
 *  File: SE/apps/client/src/lib/firebase.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  🔒 Zero-Trust Client Access:
 *    The client portal can ONLY read public listings (status="active").
 *    It CANNOT read owners, clients, requests, or agents — those are
 *    blocked by Firestore Security Rules.
 *
 *    The inquiry form writes to a public "inquiries" collection (create-only).
 *
 *  Config is read from NEXT_PUBLIC_FIREBASE_* env vars (exposed to browser).
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton — prevent re-init on hot reload
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db: Firestore = getFirestore(app);
export { app };
