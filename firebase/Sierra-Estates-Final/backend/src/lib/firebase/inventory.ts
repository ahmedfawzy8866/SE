import { db } from './firebase-client';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
} from 'firebase/firestore';

export class InventoryService {
  private col = collection(db, 'listings');

  async getProperty(id: string): Promise<DocumentData | null> {
    const snap = await getDoc(doc(db, 'listings', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  async getFeaturedListings(limitCount = 12): Promise<DocumentData[]> {
    const q = query(
      this.col,
      where('status', '==', 'active'),
      where('visibility', '==', 'public'),
      orderBy('dealScore', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}
