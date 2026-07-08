import { NextRequest } from 'next/server';
import { adminAuth } from './firebase-admin';

export interface AuthResult {
  success: boolean;
  uid?: string;
  role?: string;
  error?: string;
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Verifies a request using:
 * 1. Firebase Bearer token (Authorization: Bearer <id-token>)
 * 2. Service secret key (X-SE-SECRET-KEY header) for cron/webhooks
 */
export async function verifyRequest(req: NextRequest): Promise<AuthResult> {
  // Service secret key (cron jobs, internal webhooks)
  const secretKey = req.headers.get('x-se-secret-key') || req.headers.get('x-sbr-secret-key');
  if (secretKey && secretKey === process.env.X_SE_SECRET_KEY) {
    return { success: true, uid: 'service', role: 'service' };
  }

  // Firebase Bearer token
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      return {
        success: true,
        uid: decoded.uid,
        role: decoded.role as string | undefined,
      };
    } catch (err) {
      return { success: false, error: `Invalid token: ${String(err)}` };
    }
  }

  return { success: false, error: 'No valid authentication provided' };
}

/**
 * Verifies admin-level access:
 * - Firebase token with admin===true OR role==='admin' custom claim
 */
export async function verifyAdminRequest(req: NextRequest): Promise<AuthResult> {
  const result = await verifyRequest(req);
  if (!result.success) return result;

  // Service key is always admin
  if (result.uid === 'service') return result;

  // Check admin claim
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      const isAdmin = decoded.admin === true || decoded.role === 'admin';
      if (!isAdmin) {
        return { success: false, error: 'Admin access required' };
      }
      return { success: true, uid: decoded.uid, role: 'admin' };
    } catch (err) {
      return { success: false, error: `Token verification failed: ${String(err)}` };
    }
  }

  return { success: false, error: 'Admin access required' };
}
