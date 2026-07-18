import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import admin from 'firebase-admin';
import twilio from 'twilio';

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

if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: FIREBASE_PROJECT,
      });
      db = admin.firestore();
      console.log('Firebase Admin initialized with service account.');
    } catch (err) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', err);
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT not set — listing reads will use public Firestore REST API.');
  }
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
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // Check users/{uid} document in Firestore
    const userDoc = await db.collection("users").doc(uid).get();
    let role = userDoc.exists ? userDoc.data()?.role ?? null : null;

    // Bootstrap check: if it is the owner's email, auto-grant admin
    const bootstrappedEmails = [
      "A.fawzy8866@gmail.com", 
      "a.fawzy8866@gmail.com", 
      "emeraldestatesegypt@gmail.com"
    ];
    if (email && bootstrappedEmails.some(e => e.toLowerCase() === email.toLowerCase())) {
      role = "admin";
      // Auto-create or update the users/{uid} doc to persist it
      await db.collection("users").doc(uid).set({
        email,
        role: "admin",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
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
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const userDoc = await db.collection("users").doc(uid).get();
    const role = userDoc.exists ? userDoc.data()?.role ?? null : null;
    
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

export default app;
