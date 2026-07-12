import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { badRequest, unauthorized, successResponse } from '@/lib/server/error-response';

// Validation schema for admin auth requests
const AdminAuthTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

const AdminAuthHeaderSchema = z.object({
  authorization: z.string().min(1, 'Authorization header required'),
});

// Lazy initialize Firebase Admin SDK at runtime only
let initialized = false;

function initializeFirebaseAdmin() {
  if (initialized || getApps().length > 0) return;

  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      logger.warn('FIREBASE_SERVICE_ACCOUNT_JSON not set - Admin operations will fail');
      return;
    }

    initializeApp({
      credential: cert(JSON.parse(serviceAccountJson)),
    });
    initialized = true;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin', { error: error instanceof Error ? error.message : String(error) });
  }
}

/**
 * POST /api/admin/auth/verify
 * Verify Firebase ID token and check admin role
 */
export async function POST(req: NextRequest) {
  initializeFirebaseAdmin();
  try {
    const body = await req.json();

    // Validate input with Zod schema
    const validationResult = AdminAuthTokenSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn('Admin auth validation failed', {
        errors: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      });
      return badRequest('Invalid request parameters');
    }

    const { token } = validationResult.data;

    // Verify token with Firebase Admin SDK
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Check user role in Firestore
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    const userRole = userDoc.data()?.role;

    // Only admin and manager can access admin console
    if (!['admin', 'manager'].includes(userRole)) {
      return unauthorized('Insufficient permissions to access admin console');
    }

    return successResponse({
      valid: true,
      uid,
      role: userRole,
      email: decodedToken.email,
    });
  } catch (error) {
    logger.error('Token verification error', { error: error instanceof Error ? error.message : String(error) });
    return unauthorized('Invalid or expired token', error);
  }
}

/**
 * POST /api/admin/auth/check-role
 * Simple role check for frontend
 */
export async function GET(req: NextRequest) {
  initializeFirebaseAdmin();
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return unauthorized('Missing authorization token');
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    const userRole = userDoc.data()?.role;

    const authorized = ['admin', 'manager'].includes(userRole);

    return successResponse({
      authorized,
      uid,
      role: userRole,
    });
  } catch (error) {
    logger.error('Role check error', { error: error instanceof Error ? error.message : String(error) });
    return unauthorized('Invalid or expired token', error);
  }
}
