import { adminDb } from '@/lib/server/firebase-admin';
import type { CollectionReference, WhereFilterOp, Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';

type QueryConstraint = Parameters<CollectionReference['where']>;

export async function createDocument(
  collectionName: string,
  data: Record<string, unknown>
): Promise<string> {
  const ref = await adminDb.collection(collectionName).add({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function getDocument(
  collectionName: string,
  id: string
): Promise<Record<string, unknown> | null> {
  const snap = await adminDb.collection(collectionName).doc(id).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

export async function updateDocument(
  collectionName: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await adminDb.collection(collectionName).doc(id).update({
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  await adminDb.collection(collectionName).doc(id).delete();
}

export async function queryDocuments(
  collectionName: string,
  constraints: Array<{ field: string; op: WhereFilterOp; value: unknown }>,
  options: { orderBy?: string; orderDir?: 'asc' | 'desc'; limit?: number } = {}
): Promise<Array<Record<string, unknown>>> {
  let q: Query = adminDb.collection(collectionName);

  for (const c of constraints) {
    q = q.where(c.field, c.op, c.value);
  }
  if (options.orderBy) {
    q = q.orderBy(options.orderBy, options.orderDir || 'asc');
  }
  if (options.limit) {
    q = q.limit(options.limit);
  }

  const snap = await q.get();
  return snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }));
}

// Client-side subscription helper (for use with client SDK, not Admin)
export function subscribeToCollection(
  _collectionName: string,
  _callback: (docs: Array<Record<string, unknown>>) => void
): () => void {
  // This is a stub for the server side; use Firebase client SDK for real-time subscriptions
  console.warn('[subscribeToCollection] Use the Firebase client SDK for real-time subscriptions');
  return () => {};
}
