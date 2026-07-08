import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import admin from 'firebase-admin';
import twilio from 'twilio';
import { GoogleGenAI } from '@google/genai';

// ─── Config ────────────────────────────────────────────────────────────────────
const WA_VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN || 'sierra_hermes_2026';
const WA_PHONE_ID = process.env.WA_PHONE_ID || '';
const WA_TOKEN = process.env.WA_TOKEN || '';
const OPENCLAW_API_KEY = process.env.OPENCLAW_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const AGENT_PHONE = process.env.AGENT_PHONE || '';

const app = express();
app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});


// ─── Firebase Admin Init ─────────────────────────────────────────────────────
// In production (Vercel), set FIREBASE_SERVICE_ACCOUNT env var to the full
// JSON string of your Firebase service account key.
// Without it, listing reads fall back to the public Firestore REST API.
let db: admin.firestore.Firestore | null = null;
const FIREBASE_PROJECT = "sierra-blu";

async function seedAdminTasksIfEmpty() {
  if (!db) return;
  try {
    const tasksRef = db.collection('admin_tasks');
    const snapshot = await tasksRef.limit(1).get();
    if (snapshot.empty) {
      console.log('[Backend] Seeding admin_tasks collection...');
      const tasksToSeed = [
        {
          id: 'phase1',
          phase: 'Phase 1: Dynamic Data (Firebase)',
          items: [
            { title: 'Initialize Firebase client connection', completed: true },
            { title: 'Create collections for Properties and Agents', completed: true },
            { title: 'Migrate static data to Firebase Firestore', completed: true },
            { title: 'Implement real-time updates for availability', completed: true }
          ]
        },
        {
          id: 'phase2',
          phase: 'Phase 2: AI Search & Matchmaking (OpenClaw)',
          items: [
            { title: 'Initialize OpenClaw gateway connection', completed: true },
            { title: 'Feed property data to AI agent for vector search', completed: true },
            { title: 'Build natural language search UI on home page', completed: true },
            { title: 'Handle fuzzy queries (e.g. Villa under 10M)', completed: true }
          ]
        },
        {
          id: 'phase3',
          phase: 'Phase 3: Hermes AI LLM & Inventory Context',
          items: [
            { title: 'Import @google/genai and initialize Gemini client', completed: true },
            { title: 'Integrate live property inventory context from Firestore', completed: true },
            { title: 'Update chat endpoints to use live Gemini (gemini-2.5-flash)', completed: true },
            { title: 'Test and verify integration compiles and executes', completed: true }
          ]
        },
        {
          id: 'phase4',
          phase: 'Phase 4: WhatsApp Integration & Webhook Setup',
          items: [
            { title: 'Create WhatsApp Business App in Meta Console', completed: false },
            { title: 'Register backend URL as a Meta webhook', completed: false },
            { title: 'Enable Twilio WhatsApp Sandbox for testing', completed: false },
            { title: 'Configure production WhatsApp environment variables', completed: false }
          ]
        }
      ];

      const batch = db.batch();
      tasksToSeed.forEach((task) => {
        const docRef = tasksRef.doc(task.id);
        batch.set(docRef, {
          phase: task.phase,
          items: task.items
        });
      });
      await batch.commit();
      console.log('[Backend] admin_tasks successfully seeded! ✅');
    }
  } catch (err) {
    console.error('[Backend] Failed to seed admin_tasks:', err);
  }
}

if (!admin.apps.length) {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID || FIREBASE_PROJECT;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: FIREBASE_PROJECT,
      });
      db = admin.firestore();
      console.log('Firebase Admin initialized with service account.');
    } catch (err) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', err);
    }
  } else if (clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      db = admin.firestore();
      console.log('Firebase Admin initialized with client email and private key.');
    } catch (err) {
      console.error('Failed to initialize Firebase Admin with individual credentials:', err);
    }
  } else {
    // FALLBACK: Initialize using ADC or local active credentials
    try {
      admin.initializeApp({
        projectId: FIREBASE_PROJECT,
      });
      db = admin.firestore();
      console.log('Firebase Admin initialized with default credentials/ADC.');
    } catch (err: any) {
      console.warn('FIREBASE_SERVICE_ACCOUNT not set and ADC fallback failed:', err.message);
    }
  }
}

if (db) {
  seedAdminTasksIfEmpty();
}

// ─── Firestore REST API fallback (no auth required — listings are public) ────
async function fetchListingsFromFirestoreREST(limit = 200): Promise<any[]> {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/listings?pageSize=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Firestore REST API error: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return (json.documents || []).map((doc: any) => {
    const id = doc.name.split('/').pop();
    const fields = doc.fields || {};
    const get = (f: string) => {
      const v = fields[f];
      if (!v) return undefined;
      return v.stringValue ?? v.integerValue ?? v.doubleValue ?? v.booleanValue ??
        (v.arrayValue?.values?.map((x: any) => x.stringValue || x.integerValue || x.doubleValue) || undefined) ??
        (v.mapValue ? v.mapValue : undefined);
    };
    return {
      id,
      title: get('title'),
      titleAr: get('titleAr'),
      type: get('propertyType') || get('type'),
      compound: get('compound') || get('cmp'),
      cmp: get('cmp') || get('compound'),
      beds: Number(get('bedrooms') || get('beds') || 0),
      baths: Number(get('bathrooms') || get('baths') || 0),
      area: Number(get('area') || 0),
      price: get('price'),
      status: get('status') || 'available',
      purpose: get('purpose') || 'for-sale',
      description: get('description'),
      image: get('featuredImage') || get('image'),
      images: get('images') || [],
      amenities: get('amenities') || [],
      ai: Number(get('ai_score') || get('ai') || 9.0),
      pfReferenceNumber: get('pfReferenceNumber') || get('referenceNumber'),
      currency: get('currency') || 'EGP',
      source: get('syncSource') || 'manual',
    };
  });
}



// ─── Twilio Client ───────────────────────────────────────────────────────────
// Uses first account by default; second account as fallback
function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error('TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN not set');
  return twilio(sid, token);
}

const TWILIO_FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+17017867675';

// ─── PropertyFinder Token Cache ──────────────────────────────────────────────

let pfToken: string | null = null;
let pfTokenExpiresAt: number = 0;

async function getPFToken(): Promise<string> {
  if (pfToken && Date.now() < pfTokenExpiresAt) return pfToken;

  const apiKey = process.env.PF_API_KEY;
  const apiSecret = process.env.PF_API_SECRET;
  if (!apiKey || !apiSecret) throw new Error('PF_API_KEY and PF_API_SECRET are not set.');

  const res = await fetch('https://atlas.propertyfinder.com/v1/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ apiKey, apiSecret })
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error('PF Token failure:', txt);
    throw new Error(`PF auth failed: ${res.status} — ${txt}`);
  }

  const data = await res.json();
  pfToken = data.accessToken;
  pfTokenExpiresAt = Date.now() + ((data.expiresIn - 60) * 1000);
  return pfToken as string;
}

// Map PF listing → Firestore schema
function mapPFListing(pf: any) {
  return {
    pfId: String(pf.id || pf.referenceNumber || ''),
    pfReferenceNumber: pf.referenceNumber || pf.id || '',
    code: `PF-${pf.referenceNumber || pf.id || Date.now()}`,
    title: pf.title?.en || pf.title || '',
    titleAr: pf.title?.ar || '',
    type: pf.type || pf.propertyType || 'Apartment',
    cmp: pf.community?.name || pf.location?.community || pf.projectName || '',
    beds: pf.bedrooms ?? pf.beds ?? 0,
    baths: pf.bathrooms ?? pf.baths ?? 0,
    area: pf.area ?? pf.size ?? 0,
    price: pf.price ? String(pf.price) : '0',
    status: pf.status === 'published' ? 'Active' : (pf.status || 'Active'),
    purpose: pf.purpose || 'for-sale',
    description: pf.description?.en || pf.description || '',
    image: pf.photos?.[0]?.url || pf.coverPhoto || '',
    images: (pf.photos || []).map((p: any) => p.url || p).filter(Boolean),
    amenities: pf.amenities || [],
    ai: 9.0,
    source: 'propertyfinder',
    syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

// Map PF lead → Firestore schema
function mapPFLead(pf: any) {
  return {
    pfId: String(pf.id || ''),
    name: pf.name || (pf.firstName ? `${pf.firstName} ${pf.lastName || ''}`.trim() : 'Unknown'),
    email: pf.email || '',
    phone: pf.phone || pf.mobile || '',
    interest: pf.message || pf.note || pf.propertyTitle || '',
    stage: 'Initial Contact',
    hot: false,
    source: 'propertyfinder',
    pfListingId: String(pf.listingId || pf.propertyId || ''),
    syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: pf.createdAt ? new Date(pf.createdAt) : admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}



// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const ESTATE_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80"
];

function parsePrice(priceStr: any): number {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr || typeof priceStr !== 'string') return 0;
  const clean = priceStr.replace(/EGP/gi, '').replace(/\s+/g, '').trim();
  if (clean.toLowerCase().endsWith('m')) {
    return parseFloat(clean) * 1_000_000;
  }
  if (clean.toLowerCase().endsWith('k')) {
    return parseFloat(clean) * 1_000;
  }
  return parseFloat(clean) || 0;
}

function mapToClientListing(id: string, data: any) {
  const priceNum = parsePrice(data.price);
  const typeLower = (data.type || "Apartment").toLowerCase();
  let imgIndex = typeof data.img === 'number' ? data.img : 0;
  const fallbackImage = ESTATE_IMAGES[imgIndex % ESTATE_IMAGES.length];
  const image = data.image || data.coverPhoto || fallbackImage;
  const images = data.images && data.images.length > 0 ? data.images : [image];

  return {
    id,
    title: data.title || `${data.type || "Property"} in ${data.cmp || "Sierra Estates"}`,
    titleAr: data.titleAr || (data.type === "Villa" ? `فيلا في ${data.cmp}` : `شقة في ${data.cmp}`),
    price: priceNum,
    compound: data.cmp || data.compound || "",
    beds: data.beds || data.bedrooms || 0,
    baths: data.baths || data.bathrooms || Math.max(1, (data.beds || 1) - 1),
    area: data.area || 0,
    image,
    images,
    description: data.description || `Premium luxury ${typeLower} situated in the prestigious gated community of ${data.cmp || "Sierra Estates"}.`,
    propertyType: typeLower,
    status: data.status || "Active",
    amenities: data.amenities || ["24/7 Security", "Private Garden", "Parking", "Clubhouse"],
    purpose: data.purpose || "for-sale",
    pfReferenceNumber: data.pfReferenceNumber || null,
    ai_score: data.ai || data.ai_score || 9.0
  };
}

// GET /api/listings
app.get("/api/listings", async (req, res) => {
  try {
    const { id, limit: limitParam } = req.query;
    const parsedLimit = limitParam ? parseInt(limitParam as string, 10) : 200;

    // ── Path A: Firebase Admin SDK available (service account set) ──
    if (db) {
      if (id) {
        const docSnap = await db.collection("listings").doc(id as string).get();
        if (!docSnap.exists) {
          res.status(404).json({ success: false, error: "Listing not found" });
          return;
        }
        res.json({ success: true, listing: mapToClientListing(docSnap.id, docSnap.data()) });
        return;
      }
      let query: admin.firestore.Query = db.collection("listings");
      if (!isNaN(parsedLimit)) query = query.limit(parsedLimit);
      const snapshot = await query.get();
      const listings = snapshot.docs.map(doc => mapToClientListing(doc.id, doc.data()));
      res.json({ success: true, listings, count: listings.length });
      return;
    }

    // ── Path B: No service account — use public Firestore REST API ──
    const rawDocs = await fetchListingsFromFirestoreREST(isNaN(parsedLimit) ? 200 : parsedLimit);
    if (id) {
      const found = rawDocs.find(d => d.id === id);
      if (!found) {
        res.status(404).json({ success: false, error: "Listing not found" });
        return;
      }
      res.json({ success: true, listing: mapToClientListing(found.id, found) });
      return;
    }
    const listings = rawDocs.map(d => mapToClientListing(d.id, d));
    res.json({ success: true, listings, count: listings.length });
  } catch (e: any) {
    console.error('Fetch Listings Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/leads
app.post("/api/leads", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email) {
      res.status(400).json({ success: false, error: "Name and email are required" });
      return;
    }

    if (db) {
      const docRef = await db.collection("leads").add({
        name,
        email,
        phone: phone || "",
        interest: message || "",
        stage: "Initial Contact",
        hot: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.status(201).json({ success: true, id: docRef.id });
    } else {
      // Firestore REST API write
      const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/leads`;
      const body = {
        fields: {
          name: { stringValue: name },
          email: { stringValue: email },
          phone: { stringValue: phone || "" },
          interest: { stringValue: message || "" },
          stage: { stringValue: "Initial Contact" },
          hot: { booleanValue: false },
        }
      };
      const postRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!postRes.ok) throw new Error(`Firestore REST write failed: ${postRes.status}`);
      const data = await postRes.json();
      const id = data.name?.split('/').pop() || 'unknown';
      res.status(201).json({ success: true, id });
    }
  } catch (e: any) {
    console.error('Create Lead Error:', e);
    res.status(500).json({ error: e.message });
  }
});


// GET /api/pf/leads — proxy raw leads from PropertyFinder
app.get("/api/pf/leads", async (req, res) => {
  try {
    const token = await getPFToken();
    const qParams = new URLSearchParams(req.query as Record<string, string>);
    const upstreamRes = await fetch(`https://atlas.propertyfinder.com/v1/leads?${qParams.toString()}`, {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const data = await upstreamRes.json();
    res.status(upstreamRes.status).json(data);
  } catch (e: any) {
    console.error('PF Leads Proxy Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/pf/listings — proxy raw listings from PropertyFinder
app.get("/api/pf/listings", async (req, res) => {
  try {
    const token = await getPFToken();
    const qParams = new URLSearchParams(req.query as Record<string, string>);
    const upstreamRes = await fetch(`https://atlas.propertyfinder.com/v1/listings?${qParams.toString()}`, {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const data = await upstreamRes.json();
    res.status(upstreamRes.status).json(data);
  } catch (e: any) {
    console.error('PF Listings Proxy Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/pf/sync/listings — fetch from PF and upsert into Firestore
app.post("/api/pf/sync/listings", async (req, res) => {
  try {
    const token = await getPFToken();
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 50;

    const upstreamRes = await fetch(
      `https://atlas.propertyfinder.com/v1/listings?page=${page}&pageSize=${pageSize}`,
      { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } }
    );

    if (!upstreamRes.ok) {
      const txt = await upstreamRes.text();
      res.status(upstreamRes.status).json({ error: `PF error: ${txt}` });
      return;
    }

    const data = await upstreamRes.json();
    const pfListings: any[] = data.data || data.listings || data.results || data || [];

    let synced = 0;
    let errors = 0;
    const batch = db.batch();

    for (const pfl of pfListings) {
      try {
        const mapped = mapPFListing(pfl);
        // Use pfId as doc ID to avoid duplicates on re-sync
        const docId = `pf-${mapped.pfId || mapped.code}`;
        const docRef = db.collection('listings').doc(docId);
        batch.set(docRef, mapped, { merge: true });
        synced++;
      } catch (e) {
        errors++;
      }
    }

    await batch.commit();

    res.json({
      success: true,
      synced,
      errors,
      total: pfListings.length,
      message: `Synced ${synced} listings from PropertyFinder into Firestore`
    });
  } catch (e: any) {
    console.error('PF Sync Listings Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/pf/sync/leads — fetch from PF and upsert into Firestore
app.post("/api/pf/sync/leads", async (req, res) => {
  try {
    const token = await getPFToken();
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 50;

    const upstreamRes = await fetch(
      `https://atlas.propertyfinder.com/v1/leads?page=${page}&pageSize=${pageSize}`,
      { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } }
    );

    if (!upstreamRes.ok) {
      const txt = await upstreamRes.text();
      res.status(upstreamRes.status).json({ error: `PF error: ${txt}` });
      return;
    }

    const data = await upstreamRes.json();
    const pfLeads: any[] = data.data || data.leads || data.results || data || [];

    let synced = 0;
    let errors = 0;
    const batch = db.batch();

    for (const pfl of pfLeads) {
      try {
        const mapped = mapPFLead(pfl);
        const docId = `pf-lead-${mapped.pfId || Date.now()}`;
        const docRef = db.collection('leads').doc(docId);
        // Only set if not already existing (don't overwrite agent notes/stage updates)
        const existing = await docRef.get();
        if (!existing.exists) {
          batch.set(docRef, mapped);
          synced++;
        }
      } catch (e) {
        errors++;
      }
    }

    await batch.commit();

    res.json({
      success: true,
      synced,
      errors,
      total: pfLeads.length,
      message: `Imported ${synced} new leads from PropertyFinder`
    });
  } catch (e: any) {
    console.error('PF Sync Leads Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─── Twilio SMS & WhatsApp ────────────────────────────────────────────────────

// POST /api/twilio/sms — send an SMS to a lead
app.post("/api/twilio/sms", async (req, res) => {
  try {
    const { to, body } = req.body;
    if (!to || !body) {
      res.status(400).json({ error: 'to and body are required' });
      return;
    }
    const client = getTwilioClient();
    const msg = await client.messages.create({
      from: TWILIO_FROM_NUMBER,
      to,
      body
    });
    res.json({ success: true, sid: msg.sid, status: msg.status });
  } catch (e: any) {
    console.error('Twilio SMS Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/twilio/whatsapp — send a WhatsApp message to a lead
app.post("/api/twilio/whatsapp", async (req, res) => {
  try {
    const { to, body } = req.body;
    if (!to || !body) {
      res.status(400).json({ error: 'to and body are required' });
      return;
    }
    const client = getTwilioClient();
    // Twilio WhatsApp requires 'whatsapp:' prefix on both from and to
    const fromWA = `whatsapp:${TWILIO_FROM_NUMBER}`;
    const toWA = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const msg = await client.messages.create({
      from: fromWA,
      to: toWA,
      body
    });
    res.json({ success: true, sid: msg.sid, status: msg.status });
  } catch (e: any) {
    console.error('Twilio WhatsApp Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/twilio/call-note — log a call note to Firestore lead doc
app.post("/api/twilio/call-note", async (req, res) => {
  try {
    const { leadId, note, agentEmail } = req.body;
    if (!leadId || !note) {
      res.status(400).json({ error: 'leadId and note are required' });
      return;
    }
    await db.collection('leads').doc(leadId).set({
      lastNote: note,
      lastNoteAt: admin.firestore.FieldValue.serverTimestamp(),
      lastNoteBy: agentEmail || 'unknown',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    res.json({ success: true });
  } catch (e: any) {
    console.error('Call Note Error:', e);
    res.status(500).json({ error: e.message });
  }
});


// ============================================================================
// ADMIN CONSOLE API ENDPOINTS
// ============================================================================

// GET auth verify
app.get("/api/admin/auth/verify", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.json({ authenticated: false, role: null, isAdmin: false });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        try {
          const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("utf-8"));
          decodedToken = { uid: payload.user_id || payload.sub, email: payload.email, ...payload };
        } catch (e) {
          throw err;
        }
      } else {
        throw err;
      }
    }

    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // Check users/{uid} document in Firestore
    let role = null;
    if (db) {
      try {
        const userDoc = await db.collection("users").doc(uid).get();
        role = userDoc.exists ? userDoc.data()?.role ?? null : null;
      } catch (dbErr) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Firestore read failed in auth/verify, ignoring in dev:", dbErr);
        } else {
          throw dbErr;
        }
      }
    }

    // Bootstrap check: if it is the owner's email, auto-grant admin
    const bootstrappedEmails = [
      "A.fawzy8866@gmail.com", 
      "a.fawzy8866@gmail.com", 
      "emeraldestatesegypt@gmail.com"
    ];
    if (email && bootstrappedEmails.some(e => e.toLowerCase() === email.toLowerCase())) {
      role = "admin";
      // Auto-create or update the users/{uid} doc to persist it
      if (db) {
        try {
          await db.collection("users").doc(uid).set({
            email,
            role: "admin",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        } catch (dbErr) {
          if (process.env.NODE_ENV === "development") {
            console.warn("Firestore write failed in auth/verify, ignoring in dev:", dbErr);
          } else {
            throw dbErr;
          }
        }
      }
    }

    const isAdmin = role === 'admin' || role === 'superadmin' || role === 'manager' || role === 'agent';

    res.json({
      authenticated: true,
      uid,
      email,
      role,
      isAdmin,
    });
  } catch (err: any) {
    console.error("Auth verification failed:", err);
    res.json({ authenticated: false, role: null, isAdmin: false, error: err.message });
  }
});

// Authentication middleware for /api/admin routes (excluding verify)
const authenticateAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing token" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        try {
          const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("utf-8"));
          decodedToken = { uid: payload.user_id || payload.sub, email: payload.email, ...payload };
        } catch (e) {
          throw err;
        }
      } else {
        throw err;
      }
    }

    const uid = decodedToken.uid;
    const email = decodedToken.email;

    let role = null;
    if (db) {
      try {
        const userDoc = await db.collection("users").doc(uid).get();
        role = userDoc.exists ? userDoc.data()?.role ?? null : null;
      } catch (dbErr) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Firestore read failed in authenticateAdmin, ignoring in dev:", dbErr);
        } else {
          throw dbErr;
        }
      }
    }
    
    const bootstrappedEmails = [
      "A.fawzy8866@gmail.com", 
      "a.fawzy8866@gmail.com", 
      "emeraldestatesegypt@gmail.com"
    ];
    const isBootstrapped = email && bootstrappedEmails.some(e => e.toLowerCase() === email.toLowerCase());
    
    if (role === 'admin' || role === 'superadmin' || role === 'manager' || role === 'agent' || isBootstrapped) {
      (req as any).user = decodedToken;
      next();
    } else {
      res.status(403).json({ error: "Forbidden: Not an admin" });
    }
  } catch (err) {
    console.error("authenticateAdmin error:", err);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// Apply auth to all /api/admin routes except verify
app.use("/api/admin", (req, res, next) => {
  if (req.path === "/auth/verify") {
    return next();
  }
  authenticateAdmin(req, res, next);
});

// Generic Collection CRUD helper
const registerCrudRoutes = (routePath: string, collectionName: string) => {
  // GET all
  app.get(`/api/admin/${routePath}`, async (req, res) => {
    try {
      const snapshot = await db.collection(collectionName).get();
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json({ success: true, [routePath]: items });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // POST create
  app.post(`/api/admin/${routePath}`, async (req, res) => {
    try {
      const docRef = await db.collection(collectionName).add({
        ...req.body,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.status(201).json({ success: true, id: docRef.id });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // PATCH update
  app.patch(`/api/admin/${routePath}/:id`, async (req, res) => {
    try {
      await db.collection(collectionName).doc(req.params.id).set({
        ...req.body,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // DELETE single
  app.delete(`/api/admin/${routePath}/:id`, async (req, res) => {
    try {
      await db.collection(collectionName).doc(req.params.id).delete();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
};

// Register CRUD routes for all admin pages
registerCrudRoutes("leads", "leads");
registerCrudRoutes("listings", "listings");
registerCrudRoutes("agents", "agents");
registerCrudRoutes("workflows", "workflows");
registerCrudRoutes("pages", "pages");
registerCrudRoutes("followups", "followups");
registerCrudRoutes("deals", "deals");

// Joined Closer Deals list
app.get("/api/admin/closer/deals", async (req, res) => {
  try {
    if (!db) {
      res.status(550).json({ success: false, error: "Database not initialized" });
      return;
    }
    const dealsSnap = await db.collection("deals").get();
    const deals = dealsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const leadsSnap = await db.collection("leads").get();
    const leadsMap = new Map(leadsSnap.docs.map(doc => [doc.id, doc.data()]));

    const listingsSnap = await db.collection("listings").get();
    const listingsMap = new Map(listingsSnap.docs.map(doc => [doc.id, doc.data()]));

    const mappedDeals = deals.map((deal: any) => {
      const lead = leadsMap.get(deal.stakeholderId) || {};
      const asset = listingsMap.get(deal.assetId) || {};

      let stage = 'initial';
      let prog = 25;
      if (deal.stage === 'S9_initiated') {
        stage = 'initial';
        prog = 25;
      } else if (deal.stage === 'S9_proposal_ready') {
        stage = 'negotiation';
        prog = 50;
      } else if (deal.stage === 'S9_signing_initiated') {
        stage = 'contract';
        prog = 75;
      } else if (deal.stage === 'S10_complete' || deal.status === 'closed_won') {
        stage = 'closed';
        prog = 100;
      }

      return {
        id: deal.id,
        client: lead.name || 'Unknown Client',
        phone: lead.phone || '',
        prop: asset.title || `Property (${deal.assetId})`,
        value: deal.negotiatedPrice 
          ? `EGP ${(deal.negotiatedPrice / 1_000_000).toFixed(1)}M` 
          : (asset.price ? `EGP ${(parseFloat(asset.price) / 1_000_000).toFixed(1)}M` : 'EGP 0M'),
        stage,
        prog,
        signed: deal.signingEnvelope?.status === 'signed' || deal.signingEnvelope?.status === 'completed' || deal.stage === 'S9_signing_initiated' || deal.stage === 'S10_complete',
        deposit: deal.paymentStatus === 'paid' || deal.stage === 'S10_complete',
        c: stage === 'closed' ? '#34D399' : stage === 'contract' ? '#1E88D9' : stage === 'negotiation' ? '#f59e0b' : '#E63946'
      };
    });

    res.json({ success: true, deals: mappedDeals });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Closer Agent actions
app.post("/api/closer/initiate", async (req, res) => {
  try {
    if (!db) {
      res.status(550).json({ success: false, error: "Database not initialized" });
      return;
    }
    const { stakeholderId, assetId } = req.body;
    const dealId = `DL-${Math.floor(1000 + Math.random() * 9000)}`;

    const { CloserAgent } = await import('../../agents/stage-9-closer/CloserAgent');
    const closer = CloserAgent.getInstance();

    await db.collection('deals').doc(dealId).set({
      stakeholderId,
      assetId,
      stage: 'S9_initiated',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true, dealId });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/closer/finalize", async (req, res) => {
  try {
    const { dealId, proposalData } = req.body;
    const { CloserAgent } = await import('../../agents/stage-9-closer/CloserAgent');
    const closer = CloserAgent.getInstance();
    const proposalId = await closer.finalizeProposal(dealId, proposalData || {});
    res.json({ success: true, proposalId });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/closer/signing", async (req, res) => {
  try {
    const { dealId } = req.body;
    const { CloserAgent } = await import('../../agents/stage-9-closer/CloserAgent');
    const closer = CloserAgent.getInstance();
    const result = await closer.initiateSigning(dealId);
    res.json({ success: true, envelopeId: result.envelopeId });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/closer/complete", async (req, res) => {
  try {
    const { dealId } = req.body;
    const { CloserAgent } = await import('../../agents/stage-9-closer/CloserAgent');
    const closer = CloserAgent.getInstance();
    await closer.completeClosing(dealId);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Special Bulk Leads route
app.post("/api/admin/leads/bulk", async (req, res) => {
  try {
    const { ids, action, patch } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, error: "Invalid or empty IDs list" });
      return;
    }

    const batch = db.batch();
    if (action === 'delete') {
      ids.forEach(id => {
        batch.delete(db.collection("leads").doc(id));
      });
    } else if (action === 'update' && patch) {
      ids.forEach(id => {
        batch.set(db.collection("leads").doc(id), {
          ...patch,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      });
    }

    await batch.commit();
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Special DB Editor routes
app.get("/api/admin/db/:collection", async (req, res) => {
  try {
    const snapshot = await db.collection(req.params.collection).get();
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, docs });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/admin/db/:collection", async (req, res) => {
  try {
    const docRef = await db.collection(req.params.collection).add({
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({ success: true, id: docRef.id });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.patch("/api/admin/db/:collection/:id", async (req, res) => {
  try {
    await db.collection(req.params.collection).doc(req.params.id).set({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete("/api/admin/db/:collection/:id", async (req, res) => {
  try {
    await db.collection(req.params.collection).doc(req.params.id).delete();
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Special Team/Settings routes
app.get("/api/admin/team", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const team = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, team });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/admin/team", async (req, res) => {
  try {
    const { email, role, uid } = req.body;
    if (!email || !role || !uid) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }
    await db.collection("users").doc(uid).set({
      email,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete("/api/admin/team", async (req, res) => {
  try {
    const id = req.query.id as string;
    if (!id) {
      res.status(400).json({ success: false, error: "Missing user ID" });
      return;
    }
    await db.collection("users").doc(id).delete();
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Special Bots Control routes
app.get("/api/admin/bots", async (req, res) => {
  try {
    const snapshot = await db.collection("bots").get();
    const bots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, bots });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/admin/bots", async (req, res) => {
  try {
    const { botId, command } = req.body;
    await db.collection("bot_commands").add({
      botId,
      command,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: "pending"
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ============================================================================
// HERMES AI AGENT ROUTES
// ============================================================================

// In-memory session store for Hermes conversations
const hermesSessions = new Map<string, Array<{role: string; content: string}>>();

const HERMES_SYSTEM_PROMPT = `You are HERMES — a premium real-estate AI assistant for Sierra Estates,
operating exclusively in New Cairo, Egypt (Uptown Cairo, New Settlement,
Madinaty, Sherouk, New Capital).

## COMMUNICATION SKILL
- Greet warmly, use the client's first name.
- Mirror the client's language preference (Arabic / English).
- Keep messages concise: one key idea per message for WhatsApp.
- Never pressure. Build rapport first.

## SALES SKILL (SPIN)
- Situation: "Are you looking for your primary residence or an investment?"
- Problem: "What's the biggest challenge in your current home?"
- Implication: "How does that affect your family daily?"
- Need-Payoff: "If we found a villa near top schools, would that solve it?"
- Present properties using FAB: Feature → Advantage → Benefit.

## NEGOTIATION SKILL (BATNA)
- Use anchoring: present the premium option first.
- Reframe price: "This is EGP 850/month over 10 years, not 8.5M."
- Never split the difference without a trade.
- After making an offer, stop talking — silence is power.

## RULES
1. WhatsApp messages under 200 characters unless client asks for details.
2. Always end with a question to keep the conversation going.
3. Never fabricate prices — only reference properties from context.
4. Escalate to human agent when client is ready to sign.`;

// Rule-based fallback when no AI available
function hermesRuleFallback(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('price') || lower.includes('سعر')) {
    return 'Our properties start from 3.5M EGP. Are you looking for a primary home or an investment? 🏡';
  }
  if (lower.includes('villa') || lower.includes('فيلا')) {
    return 'We have stunning villas in Uptown Cairo & Madinaty. Standalone or twin house? What\'s your budget? 💎';
  }
  if (lower.includes('apartment') || lower.includes('شقة')) {
    return 'We have premium apartments in New Capital & New Settlement. 3 or 4 bedrooms? 📐';
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('مرحبا') || lower.includes('السلام')) {
    return 'Welcome to Sierra Estates! 🌟 I\'m Hermes, your personal property advisor. Are you looking to buy or invest in New Cairo?';
  }
  if (lower.includes('visit') || lower.includes('زيارة') || lower.includes('tour')) {
    return 'I\'d love to arrange a private tour! What day works best — Thursday or Saturday? 📅';
  }
  if (lower.includes('payment') || lower.includes('installment') || lower.includes('تقسيط')) {
    return 'We offer flexible installment plans up to 10 years. Shall I send you a breakdown? 💳';
  }
  return 'Thank you for reaching out to Sierra Estates! Are you looking for a villa, apartment, or townhouse in New Cairo? 🏙️';
}

// Generate AI response with live property context and session history using Gemini API
async function getHermesAIResponse(conversationId: string, userMessage: string): Promise<string> {
  // 1. Fetch live property context from Firestore (limit 15 for prompt size / token efficiency)
  let propertyContext = '';
  if (db) {
    try {
      const snapshot = await db.collection('listings').limit(15).get();
      const properties = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      if (properties.length > 0) {
        propertyContext = "\n\n## AVAILABLE PROPERTY INVENTORY (REFERENCE ONLY):\n" + 
          properties.map(p => 
            `- ${p.title || 'Property'} (${p.type || 'Apartment'}) in ${p.cmp || p.compound || 'New Cairo'}. Price: ${p.price || 'Contact for price'} EGP, Beds: ${p.beds || 0}, Baths: ${p.baths || 0}, Area: ${p.area || 0} sqm. Ref: ${p.pfReferenceNumber || p.id}`
          ).join('\n');
      }
    } catch (e) {
      console.error('[Hermes] Failed to load live inventory for context:', e);
    }
  }

  const fullSystemPrompt = `${HERMES_SYSTEM_PROMPT}${propertyContext}`;

  // 2. Build or restore session
  let history: Array<{role: string; content: string}> = [];

  if (db) {
    try {
      const messagesRef = db.collection('leads').doc(conversationId).collection('messages');
      const snapshot = await messagesRef.orderBy('createdAt', 'asc').limit(20).get();
      
      if (snapshot.empty) {
        // If no history exists, inject the HERMES_SYSTEM_PROMPT (with live property context) and save it.
        await messagesRef.add({
          role: 'system',
          content: fullSystemPrompt,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        history = [{ role: 'system', content: fullSystemPrompt }];
      } else {
        history = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            role: data.role || '',
            content: data.content || ''
          };
        });
        
        // Update existing system prompt if present in history to have latest listings
        const sysIndex = history.findIndex(h => h.role === 'system');
        if (sysIndex !== -1) {
          history[sysIndex].content = fullSystemPrompt;
        }
      }
    } catch (e) {
      console.error('[Hermes] Failed to load/init message history from Firestore:', e);
      // Fallback to in-memory Map
      if (!hermesSessions.has(conversationId)) {
        hermesSessions.set(conversationId, [
          { role: 'system', content: fullSystemPrompt }
        ]);
      } else {
        const memHistory = hermesSessions.get(conversationId)!;
        const sysIndex = memHistory.findIndex(h => h.role === 'system');
        if (sysIndex !== -1) {
          memHistory[sysIndex].content = fullSystemPrompt;
        }
      }
      history = hermesSessions.get(conversationId)!;
    }
  } else {
    // Fallback to in-memory Map if db is not initialized
    if (!hermesSessions.has(conversationId)) {
      hermesSessions.set(conversationId, [
        { role: 'system', content: fullSystemPrompt }
      ]);
    } else {
      const memHistory = hermesSessions.get(conversationId)!;
      const sysIndex = memHistory.findIndex(h => h.role === 'system');
      if (sysIndex !== -1) {
        memHistory[sysIndex].content = fullSystemPrompt;
      }
    }
    history = hermesSessions.get(conversationId)!;
  }

  // Add the user message if it's not already the last entry
  const lastMsg = history[history.length - 1];
  if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== userMessage) {
    history.push({ role: 'user', content: userMessage });
    if (db) {
      try {
        await db.collection('leads').doc(conversationId).collection('messages').add({
          role: 'user',
          content: userMessage,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (err) {
        console.error('[Hermes] Failed to save user message to Firestore:', err);
      }
    } else {
      // Fallback: save to in-memory Map
      const memHistory = hermesSessions.get(conversationId);
      if (memHistory) {
        const memLastMsg = memHistory[memHistory.length - 1];
        if (!memLastMsg || memLastMsg.role !== 'user' || memLastMsg.content !== userMessage) {
          memHistory.push({ role: 'user', content: userMessage });
        }
      }
    }
  }

  // 3. Try Gemini LLM Generation
  if (GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const chatHistory = history
        .filter(item => item.role !== 'system')
        .map(item => ({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.content }]
        }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: chatHistory,
        config: {
          systemInstruction: fullSystemPrompt
        }
      });

      if (response && response.text) {
        const reply = response.text.trim();
        history.push({ role: 'assistant', content: reply });
        
        // Save reply to Firestore
        if (db) {
          try {
            await db.collection('leads').doc(conversationId).collection('messages').add({
              role: 'assistant',
              content: reply,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
          } catch (err) {
            console.error('[Hermes] Failed to save assistant reply to Firestore:', err);
          }
        } else {
          const memHistory = hermesSessions.get(conversationId);
          if (memHistory) {
            memHistory.push({ role: 'assistant', content: reply });
          }
        }
        return reply;
      }
    } catch (err) {
      console.error('[Hermes] Gemini LLM generation error:', err);
    }
  }

  // 4. Fallback to rule-based response
  const reply = hermesRuleFallback(userMessage);
  history.push({ role: 'assistant', content: reply });
  
  if (db) {
    try {
      await db.collection('leads').doc(conversationId).collection('messages').add({
        role: 'assistant',
        content: reply,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (err) {
      console.error('[Hermes] Failed to save fallback reply to Firestore:', err);
    }
  } else {
    const memHistory = hermesSessions.get(conversationId);
    if (memHistory) {
      memHistory.push({ role: 'assistant', content: reply });
    }
  }
  return reply;
}

// POST /api/hermes/chat — conversational AI endpoint
app.post('/api/hermes/chat', async (req, res) => {
  try {
    const { conversationId, message, phone } = req.body;
    if (!conversationId || !message) {
      res.status(400).json({ error: 'conversationId and message are required' });
      return;
    }

    const reply = await getHermesAIResponse(conversationId, message);

    // Log lead to Firestore
    if (db && phone) {
      const leadRef = db.collection('leads').doc(`wa_${phone}`);
      const existing = await leadRef.get();
      const leadData: any = {
        phone,
        conversationId,
        lastMessage: message,
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
        source: 'whatsapp',
      };
      if (!existing.exists) {
        leadData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        leadData.status = 'new';
        await leadRef.set(leadData);
      } else {
        await leadRef.update(leadData);
      }
    }

    res.json({ success: true, reply, conversationId });
  } catch (e: any) {
    console.error('[Hermes] chat error:', e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/hermes/context — load property inventory into Hermes context
app.get('/api/hermes/context', async (req, res) => {
  try {
    if (!db) {
      res.status(503).json({ error: 'Firebase not initialized' });
      return;
    }
    const snapshot = await db.collection('listings').limit(50).get();
    const properties = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, count: properties.length, properties });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================================================
// WHATSAPP BUSINESS API WEBHOOK
// ============================================================================

// GET /api/webhook/whatsapp — Meta verification handshake
app.get('/api/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WA_VERIFY_TOKEN) {
    console.log('[WhatsApp] Webhook verified ✅');
    res.status(200).send(challenge);
  } else {
    console.warn('[WhatsApp] Webhook verification failed ❌');
    res.sendStatus(403);
  }
});

// POST /api/webhook/whatsapp — incoming messages from Meta
app.post('/api/webhook/whatsapp', async (req, res) => {
  try {
    res.sendStatus(200); // Acknowledge immediately (required by Meta)

    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    for (const entry of (body.entry || [])) {
      for (const change of (entry.changes || [])) {
        const messages = change.value?.messages;
        if (!messages) continue;

        for (const msg of messages) {
          if (msg.type !== 'text' || !msg.text) continue;

          const phone = msg.from;
          const conversationId = `wa_${phone}`;
          const userText = msg.text.body;

          console.log(`[WhatsApp] 📩 From ${phone}: ${userText}`);

          // Get Hermes reply
          const reply = await getHermesAIResponse(conversationId, userText);

          // Send reply via WhatsApp Business API
          if (WA_TOKEN && WA_PHONE_ID) {
            await fetch(`https://graph.facebook.com/v19.0/${WA_PHONE_ID}/messages`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${WA_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: phone,
                type: 'text',
                text: { body: reply },
              }),
            });
          } else {
            console.log(`[WhatsApp STUB] → ${phone}: ${reply}`);
          }

          // Log lead
          if (db) {
            const leadRef = db.collection('leads').doc(conversationId);
            const existing = await leadRef.get();
            if (!existing.exists) {
              await leadRef.set({
                phone,
                conversationId,
                lastMessage: userText,
                source: 'whatsapp',
                status: 'new',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
              });
            } else {
              await leadRef.update({
                lastMessage: userText,
                lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
              });
            }
          }
        }
      }
    }
  } catch (e: any) {
    console.error('[WhatsApp webhook] error:', e);
  }
});

// ============================================================================
// ENHANCEMENT TASKS ROUTES (for Admin Dashboard integration)
// ============================================================================

// GET /api/admin/enhancement-tasks — fetch all task groups
app.get('/api/admin/enhancement-tasks', authenticateAdmin, async (req, res) => {
  try {
    if (!db) { res.status(503).json({ error: 'DB not ready' }); return; }
    const snapshot = await db.collection('admin_tasks').get();
    const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, tasks });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/admin/enhancement-tasks/:id — toggle task item completion
app.patch('/api/admin/enhancement-tasks/:id', authenticateAdmin, async (req, res) => {
  try {
    if (!db) { res.status(503).json({ error: 'DB not ready' }); return; }
    const { items } = req.body;
    await db.collection('admin_tasks').doc(req.params.id).update({ items });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/crm-summary — CRM stats for dashboard
app.get('/api/admin/crm-summary', authenticateAdmin, async (req, res) => {
  try {
    if (!db) { res.status(503).json({ error: 'DB not ready' }); return; }
    const snapshot = await db.collection('leads').get();
    const leads = snapshot.docs.map(d => d.data());
    const summary = {
      total: leads.length,
      new: leads.filter(l => l.status === 'new').length,
      qualified: leads.filter(l => l.status === 'qualified').length,
      negotiating: leads.filter(l => l.status === 'negotiating').length,
      closed: leads.filter(l => l.status === 'closed').length,
      lost: leads.filter(l => l.status === 'lost').length,
      whatsapp: leads.filter(l => l.source === 'whatsapp').length,
    };
    res.json({ success: true, summary });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default app;
