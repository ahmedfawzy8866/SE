/**
 * Sierra Estates 3.0 TypeScript Type Definitions
 */

export interface Lead {
  id: string;
  name: string;
  phone: string;
  interest: string;
  stage: "Viewing Scheduled" | "AI Matched" | "Contract Draft" | "Initial Contact" | "Negotiating";
  color: string;
  hot: boolean;
  createdAt: Date;
  updatedAt: Date;
  ownerId?: string;
  archived?: boolean;
}

export interface Listing {
  id: string;
  code: string;
  cmp: string;
  type: string;
  beds: number;
  area: number;
  price: string;
  ai: number;
  status: "Active" | "Review" | "Sold";
  img: number;
  publishToClient?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Agent {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  color: string;
  status: "Online" | "Running" | "Idle";
  load: number;
  tasks: number;
  updatedAt: Date;
}

export interface Workflow {
  id: string;
  name: string;
  nameAr?: string;
  desc?: string;
  descAr?: string;
  status: "active" | "warning" | "paused";
  runs: number;
  last: string;
  color: string;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: Date;
}

export interface AdminUser {
  id: string;
  email: string;
  role: "Admin" | "Superadmin";
  status?: "approved" | "pending";
  createdAt: Date;
}

export interface SierraNotification {
  id: string;
  type: "lead" | "listing" | "error" | "system";
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  read: boolean;
  createdAt: Date;
}

export interface SearchLog {
  id: string;
  query: string;
  scope: 'all' | 'leads' | 'listings' | 'agents' | 'workflows';
  timestamp: Date;
  userId?: string;
  isVoice?: boolean;
}

/**
 * Public client-portal listing — the shape of documents in the Firestore
 * `listings` collection as read by the public portal (apps/client).
 * Snake_case field names mirror the Firestore documents; distinct from the
 * admin-dashboard `Listing` summary above.
 */
export interface PublicListing {
  id: string;
  /** Only listings with status "active" are publicly visible. */
  status: string;
  mode: 'sale' | 'rent';
  compound_name: string;
  location_sector: string;
  property_type: string;
  bedrooms: number;
  bathrooms?: number;
  area_sqm: number;
  price_egp: number;
  finishing: string;
  delivery_status: string;
  payment_plan?: string;
  cover_image_url?: string;
  virtual_tour_url?: string;
  ai_score?: number;
  /** Firestore Timestamp (serverTimestamp on write). */
  created_at?: unknown;
}
