import * as admin from 'firebase-admin';

function initAdmin(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;

  // Option 1: Full JSON blob
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      return admin.initializeApp({
        credential: admin.credential.cert(sa),
        projectId: sa.project_id,
      });
    } catch (e) {
      console.warn('[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e);
    }
  }

  // Option 2: Individual env vars
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }

  // Fallback: Application Default Credentials (GCP / Cloud Run)
  console.warn('[firebase-admin] Using Application Default Credentials — ensure GOOGLE_APPLICATION_CREDENTIALS is set in production.');
  return admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'sierra-estates-prod',
  });
}

const app = initAdmin();

export const adminDb      = admin.firestore(app);
export const adminAuth    = admin.auth(app);
export const adminStorage = admin.storage(app);
export { admin };
