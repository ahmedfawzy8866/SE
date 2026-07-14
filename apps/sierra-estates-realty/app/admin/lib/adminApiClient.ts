'use client';

/**
 * Admin REST client — same-origin wrapper around the Next.js /api/admin/*
 * routes, authenticated with the current Firebase user's ID token.
 *
 * Ported from SE's Vite admin (apps/admin/src/lib/apiClient.ts), which hit an
 * external VITE_BACKEND_API_URL. Here the backend routes live in THIS app
 * (app/api/admin/*), so calls are same-origin (empty base URL). This is the
 * intended REST path: the admin UI talks to the auth-guarded API routes
 * rather than writing to Firestore directly.
 */

import { auth } from '@/lib/firebase';

const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || '';

async function authHeader(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(await authHeader()),
      ...init?.headers,
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as any)?.error || `Request to ${path} failed with status ${res.status}`);
  }
  return body as T;
}

export const adminApi = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(data ?? {}) }),
  patch: <T>(path: string, data?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(data ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
