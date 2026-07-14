import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

let initialized = false;

function initializeFirebaseAdmin() {
  if (initialized || getApps().length > 0) return;

  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      console.warn('FIREBASE_SERVICE_ACCOUNT_JSON not set');
      return;
    }

    initializeApp({
      credential: cert(JSON.parse(serviceAccountJson)),
    });
    initialized = true;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

/**
 * Verify Firebase ID token and admin/manager role
 * Returns { valid: true, uid, role, email } or throws error
 */
export async function verifyAdminRequest(req: NextRequest) {
  initializeFirebaseAdmin();

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split('Bearer ')[1];

  if (!token) {
    throw new Error('Missing Bearer token');
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    const userRole = userDoc.data()?.role;

    if (!['admin', 'manager'].includes(userRole)) {
      throw new Error('Insufficient permissions');
    }

    return {
      valid: true,
      uid,
      role: userRole,
      email: decodedToken.email,
    };
  } catch (error) {
    throw new Error(`Token verification failed: ${error}`);
  }
}

/**
 * Verify service/cron secret key
 */
export async function verifySecretKey(req: NextRequest) {
  const secretKey = req.headers.get('x-sbr-secret-key');
  const envSecret = process.env.SBR_SECRET_KEY;

  if (!secretKey || !envSecret || secretKey !== envSecret) {
    throw new Error('Invalid or missing secret key');
  }

  return true;
}

/**
 * Wrap API route with auth guard
 */
export function withAdminAuth(handler: (req: NextRequest, context: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context: any) => {
    try {
      await verifyAdminRequest(req);
      return handler(req, context);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unauthorized' },
        { status: 401 }
      );
    }
  };
}

/**
 * Wrap cron/webhook route with secret key
 */
export function withSecretKey(handler: (req: NextRequest, context: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context: any) => {
    try {
      await verifySecretKey(req);
      return handler(req, context);
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  };
}
