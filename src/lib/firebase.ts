/**
 * Firebase client singleton
 * ────────────────────────────────────────────────────────────────────────────
 * Central Firebase initialization for the SE frontend.
 *
 * - Reads config from NEXT_PUBLIC_FIREBASE_* env vars.
 * - In dev without credentials, falls back to a placeholder config + a mock
 *   Firestore proxy that throws on use — so the page renders seed data
 *   instead of crashing.
 * - `isFirebaseClientConfigured` lets hooks know whether to attempt real
 *   subscriptions or skip straight to the seed fallback.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const isDummyKey = (key?: string) => {
  if (!key) return true;
  return key.includes('Dummy') || key === 'AIzaSyDummyKey123456789' || key === 'your_api_key_here';
};

const hasValidFirebaseConfig = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID &&
  !isDummyKey(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
);

const isBuildTime =
  typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build';

if (!hasValidFirebaseConfig && !isBuildTime && typeof window !== 'undefined') {
   
  console.warn('[firebase] Using dev placeholder — set NEXT_PUBLIC_FIREBASE_* env vars for prod.');
}

const firebaseConfig = hasValidFirebaseConfig
  ? {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    }
  : {
      apiKey: 'dev-mode-placeholder',
      authDomain: 'dev.firebaseapp.com',
      projectId: 'dev-project',
      storageBucket: 'dev.appspot.com',
      messagingSenderId: '000000000000',
      appId: '1:000000000000:web:dev',
    };

let app: FirebaseApp;
try {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
} catch (err) {
   
  console.warn('[firebase] init failed, falling back to first app:', err);
  app = getApps()[0];
}

export const isFirebaseClientConfigured = hasValidFirebaseConfig;

const createMockAuth = (): Auth =>
  new Proxy({} as Auth, {
    get(target, prop) {
      if (prop === '_isProxy') return true;
      if (prop === 'currentUser') return null;
      return () => Promise.resolve(null);
    },
  });

const unavailableClientService = <T>(serviceName: string): T =>
  new Proxy(
    {},
    {
      get() {
        throw new Error(
          `Firebase client ${serviceName} is unavailable — set NEXT_PUBLIC_FIREBASE_* env vars.`,
        );
      },
    },
  ) as T;

export const auth: Auth =
  hasValidFirebaseConfig && !isBuildTime ? getAuth(app) : createMockAuth();

export const db: Firestore =
  hasValidFirebaseConfig && !isBuildTime ? getFirestore(app) : unavailableClientService<Firestore>('firestore');

export const storage: FirebaseStorage =
  hasValidFirebaseConfig && !isBuildTime
    ? getStorage(app)
    : unavailableClientService<FirebaseStorage>('storage');

export default app;
