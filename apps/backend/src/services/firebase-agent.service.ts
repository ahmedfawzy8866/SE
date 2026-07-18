/**
 * Firebase Agent Service
 * Bridges agents with Firestore for real-time operations
 */

import {
  getFirestoreAdmin,
  getAuthAdmin,
  createCustomToken,
} from '@sierra-estates/config/firebase-admin';
import { FirestoreListing, FirestoreCompound, User } from '@sierra-estates/types';

/**
 * Agent Session Manager
 * Tracks agent workflows in Firestore
 */
export class AgentSessionManager {
  private db = getFirestoreAdmin();

  /**
   * Create a new agent session
   */
  async createSession(
    clientId: string,
    agentType: string,
    context: Record<string, any>
  ) {
    const session = {
      client_uid: clientId,
      agent_type: agentType,
      status: 'active',
      context,
      created_at: new Date(),
      updated_at: new Date(),
      messages: [],
    };

    const docRef = await this.db.collection('agent_sessions').add(session);
    return { id: docRef.id, ...session };
  }

  /**
   * Get agent session
   */
  async getSession(sessionId: string) {
    const doc = await this.db.collection('agent_sessions').doc(sessionId).get();
    if (!doc.exists) throw new Error('Session not found');
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Add message to session
   */
  async addMessage(
    sessionId: string,
    authorId: string,
    role: 'user' | 'agent',
    content: string
  ) {
    const message = {
      author_uid: authorId,
      role,
      content,
      timestamp: new Date(),
    };

    await this.db
      .collection('agent_sessions')
      .doc(sessionId)
      .collection('messages')
      .add(message);

    return message;
  }

  /**
   * Update session status
   */
  async updateStatus(
    sessionId: string,
    status: 'active' | 'paused' | 'completed' | 'error'
  ) {
    await this.db.collection('agent_sessions').doc(sessionId).update({
      status,
      updated_at: new Date(),
    });
  }

  /**
   * Close session
   */
  async closeSession(sessionId: string, result: any) {
    await this.db.collection('agent_sessions').doc(sessionId).update({
      status: 'completed',
      result,
      updated_at: new Date(),
    });
  }
}

/**
 * Property Data Manager
 * CRUD operations for listings and compounds via Firebase
 */
export class PropertyDataManager {
  private db = getFirestoreAdmin();

  /**
   * Get active listings
   */
  async getActiveListings(limit = 100): Promise<FirestoreListing[]> {
    const snap = await this.db
      .collection('houyez_listings')
      .where('status', '==', 'active')
      .limit(limit)
      .get();

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreListing));
  }

  /**
   * Search listings by price range
   */
  async searchListingsByPrice(
    minPrice: number,
    maxPrice: number,
    limit = 50
  ): Promise<FirestoreListing[]> {
    const snap = await this.db
      .collection('houyez_listings')
      .where('price', '>=', minPrice)
      .where('price', '<=', maxPrice)
      .limit(limit)
      .get();

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreListing));
  }

  /**
   * Get listings by compound
   */
  async getListingsByCompound(compoundId: string): Promise<FirestoreListing[]> {
    const snap = await this.db
      .collection('houyez_listings')
      .where('location.compoundId', '==', compoundId)
      .get();

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreListing));
  }

  /**
   * Get featured listings
   */
  async getFeaturedListings(limit = 20): Promise<FirestoreListing[]> {
    const snap = await this.db
      .collection('houyez_listings')
      .where('featured', '==', true)
      .where('status', '==', 'active')
      .limit(limit)
      .get();

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreListing));
  }

  /**
   * Create listing
   */
  async createListing(data: Partial<FirestoreListing>) {
    const listing = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await this.db.collection('houyez_listings').add(listing);
    return { id: docRef.id, ...listing };
  }

  /**
   * Update listing
   */
  async updateListing(listingId: string, updates: Partial<FirestoreListing>) {
    await this.db.collection('houyez_listings').doc(listingId).update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Get compounds
   */
  async getCompounds(limit = 100): Promise<FirestoreCompound[]> {
    const snap = await this.db
      .collection('houyez_compounds')
      .where('active', '==', true)
      .limit(limit)
      .get();

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreCompound));
  }
}

/**
 * User & Auth Manager
 * Manage user roles and permissions
 */
export class UserAuthManager {
  private auth = getAuthAdmin();
  private db = getFirestoreAdmin();

  /**
   * Create or update user
   */
  async upsertUser(uid: string, userData: Partial<User>) {
    const user = {
      ...userData,
      updatedAt: new Date(),
    };

    await this.db.collection('users').doc(uid).set(user, { merge: true });
    return { uid, ...user };
  }

  /**
   * Get user
   */
  async getUser(uid: string): Promise<User | null> {
    const doc = await this.db.collection('users').doc(uid).get();
    if (!doc.exists) return null;
    return { uid, ...doc.data() } as User;
  }

  /**
   * Set user role
   */
  async setUserRole(uid: string, role: 'admin' | 'staff' | 'agent' | 'user') {
    await this.auth.setCustomUserClaims(uid, { role });
    await this.db.collection('users').doc(uid).update({ role });
  }

  /**
   * Create custom token for agent impersonation
   */
  async createAgentToken(uid: string) {
    return await createCustomToken(uid, { role: 'agent' });
  }

  /**
   * Verify user permissions
   */
  async hasPermission(uid: string, permission: string): Promise<boolean> {
    const user = await this.getUser(uid);
    if (!user) return false;
    return user.permissions?.includes(permission) ?? false;
  }
}

/**
 * Analytics Manager
 * Track agent and property events
 */
export class AnalyticsManager {
  private db = getFirestoreAdmin();

  /**
   * Log event
   */
  async logEvent(
    userId: string,
    eventType: string,
    properties: Record<string, any>
  ) {
    const event = {
      userId,
      event: eventType,
      properties,
      timestamp: new Date(),
    };

    await this.db.collection('analytics').add(event);
  }

  /**
   * Log listing view
   */
  async logListingView(userId: string, listingId: string) {
    await this.logEvent(userId, 'listing_viewed', { listingId });

    // Increment view counter
    await this.db
      .collection('houyez_listings')
      .doc(listingId)
      .update({
        views: require('firebase-admin').firestore.FieldValue.increment(1),
      });
  }

  /**
   * Log inquiry
   */
  async logInquiry(userId: string, listingId: string, message: string) {
    await this.logEvent(userId, 'inquiry_created', { listingId, message });

    // Increment inquiry counter
    await this.db
      .collection('houyez_listings')
      .doc(listingId)
      .update({
        inquiries: require('firebase-admin').firestore.FieldValue.increment(1),
      });
  }
}

// Singleton exports
export const agentSessionManager = new AgentSessionManager();
export const propertyDataManager = new PropertyDataManager();
export const userAuthManager = new UserAuthManager();
export const analyticsManager = new AnalyticsManager();
