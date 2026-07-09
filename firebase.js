/* ═══════════════════════════════════════════════════════════════════════════
 * Sierra Estates — Firebase Firestore Integration Layer
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Provides a clean async API for the SE portal to talk to Firestore.
 *  Uses Firebase compat SDK (works with the portal's ES5-style IIFEs).
 *
 *  PUBLIC API (window.SIERRA_DB):
 *    - isReady()              → boolean (true if Firestore is connected)
 *    - getCompounds()         → Promise<array> (with onSnapshot live updates)
 *    - getCompound(name)      → Promise<object|null>
 *    - getListings(filter)    → Promise<array>
 *    - getUnitsFor(name)      → Promise<array>
 *    - addInquiry(data)       → Promise<{id}> (writes to 'inquiries' collection)
 *    - addCareerApp(data)     → Promise<{id}> (writes to 'career_applications')
 *    - subscribe(callback)    → unsubscribe fn (live compounds updates)
 *
 *  FALLBACK BEHAVIOR:
 *    If SIERRA_FIREBASE_ENABLED is false OR Firebase fails to load, all
 *    methods fall back to the static data.js (window.HZDATA). This means
 *    the portal ALWAYS works — Firestore is a progressive enhancement.
 * ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var D = window.HZDATA;
  var db = null;
  var connected = false;

  // ── Initialize Firebase (only if enabled + config is filled in) ──
  function init() {
    if (!window.SIERRA_FIREBASE_ENABLED) return false;
    if (!window.firebase || !window.SIERRA_FIREBASE_CONFIG) return false;
    var cfg = window.SIERRA_FIREBASE_CONFIG;
    // Check if config still has placeholder values
    if (cfg.apiKey.indexOf('PASTE-YOUR') === 0) return false;
    try {
      firebase.initializeApp(cfg);
      db = firebase.firestore();
      connected = true;
      if (window.console) console.info('[Sierra] Firestore connected to project:', cfg.projectId);
      return true;
    } catch (e) {
      if (window.console) console.warn('[Sierra] Firestore init failed, using static fallback:', e.message);
      return false;
    }
  }

  // ── Collections ──
  var COL = {
    compounds: 'compounds',
    listings: 'listings',
    units: 'units',
    inquiries: 'inquiries',
    career_applications: 'career_applications',
    agents: 'agents'
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  PUBLIC API
  // ═════════════════════════════════════════════════════════════════════════

  function isReady() { return connected; }

  // ── Get all compounds (async) ──
  // Falls back to static data.js if Firestore not connected.
  function getCompounds() {
    if (!connected) {
      return Promise.resolve(D.compounds || []);
    }
    return db.collection(COL.compounds).get().then(function (snap) {
      return snap.docs.map(function (d) {
        var data = d.data();
        data.id = d.id;
        return data;
      });
    }).catch(function (err) {
      console.warn('[Sierra] getCompounds failed, using fallback:', err.message);
      return D.compounds || [];
    });
  }

  // ── Get single compound by name ──
  function getCompound(name) {
    if (!connected) {
      var found = (D.compounds || []).find(function (c) { return c.n === name; });
      return Promise.resolve(found || null);
    }
    return db.collection(COL.compounds).where('n', '==', name).limit(1).get().then(function (snap) {
      if (snap.empty) return null;
      var d = snap.docs[0];
      var data = d.data();
      data.id = d.id;
      return data;
    }).catch(function () {
      var found = (D.compounds || []).find(function (c) { return c.n === name; });
      return found || null;
    });
  }

  // ── Get units for a compound (async) ──
  // Falls back to D.unitsFor() deterministic generator if Firestore not connected.
  function getUnitsFor(name) {
    if (!connected) {
      return Promise.resolve(D.unitsFor ? D.unitsFor(name) : []);
    }
    return db.collection(COL.units).where('compound', '==', name).get().then(function (snap) {
      if (snap.empty) {
        // Fallback to deterministic generator if no units in Firestore yet
        return D.unitsFor ? D.unitsFor(name) : [];
      }
      return snap.docs.map(function (d) {
        var data = d.data();
        data.id = d.id;
        return data;
      });
    }).catch(function () {
      return D.unitsFor ? D.unitsFor(name) : [];
    });
  }

  // ── Get listings with optional filter ──
  function getListings(filter) {
    filter = filter || {};
    if (!connected) {
      var listings = D.listings || [];
      if (filter.mode) listings = listings.filter(function (l) { return l.mode === filter.mode; });
      if (filter.type) listings = listings.filter(function (l) { return l.type === filter.type; });
      if (filter.minBeds) listings = listings.filter(function (l) { return l.beds >= filter.minBeds; });
      if (filter.maxPrice) listings = listings.filter(function (l) { return l.egpM <= filter.maxPrice; });
      return Promise.resolve(listings);
    }
    var q = db.collection(COL.listings);
    if (filter.mode) q = q.where('mode', '==', filter.mode);
    if (filter.type) q = q.where('type', '==', filter.type);
    return q.limit(50).get().then(function (snap) {
      var results = snap.docs.map(function (d) {
        var data = d.data();
        data.id = d.id;
        return data;
      });
      if (filter.minBeds) results = results.filter(function (l) { return l.beds >= filter.minBeds; });
      if (filter.maxPrice) results = results.filter(function (l) { return l.egpM <= filter.maxPrice; });
      return results;
    }).catch(function () {
      return D.listings || [];
    });
  }

  // ── Add inquiry (from index.html form) ──
  // Returns {id, fallback} — if fallback is true, it used localStorage
  // instead of Firestore (e.g. Firestore not connected or write failed).
  function addInquiry(data) {
    var payload = {
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString(),
      mode: data.mode || 'buy',
      name: data.name || '',
      phone: data.phone || '',
      email: data.email || '',
      zone: data.zone || '',
      type: data.type || '',
      budget: data.budget || '',
      status: 'new',
      source: 'website'
    };
    if (!connected) {
      // Fallback: save to localStorage
      try {
        var log = JSON.parse(localStorage.getItem('sierra_inquiries') || '[]');
        log.push(Object.assign({ id: 'local-' + Date.now() }, payload));
        localStorage.setItem('sierra_inquiries', JSON.stringify(log));
      } catch (e) {}
      return Promise.resolve({ id: 'local-' + Date.now(), fallback: true });
    }
    return db.collection(COL.inquiries).add(payload).then(function (ref) {
      return { id: ref.id, fallback: false };
    }).catch(function (err) {
      console.warn('[Sierra] addInquiry failed, using localStorage fallback:', err.message);
      try {
        var log = JSON.parse(localStorage.getItem('sierra_inquiries') || '[]');
        log.push(Object.assign({ id: 'local-' + Date.now() }, payload));
        localStorage.setItem('sierra_inquiries', JSON.stringify(log));
      } catch (e) {}
      return { id: 'local-' + Date.now(), fallback: true };
    });
  }

  // ── Add career application (from career.html form) ──
  function addCareerApp(data) {
    var payload = {
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString(),
      name: data.name || '',
      phone: data.phone || '',
      email: data.email || '',
      position: data.position || '',
      experience: data.experience || '',
      message: data.message || '',
      status: 'new'
    };
    if (!connected) {
      try {
        var log = JSON.parse(localStorage.getItem('sierra_career_apps') || '[]');
        log.push(Object.assign({ id: 'local-' + Date.now() }, payload));
        localStorage.setItem('sierra_career_apps', JSON.stringify(log));
      } catch (e) {}
      return Promise.resolve({ id: 'local-' + Date.now(), fallback: true });
    }
    return db.collection(COL.career_applications).add(payload).then(function (ref) {
      return { id: ref.id, fallback: false };
    }).catch(function (err) {
      console.warn('[Sierra] addCareerApp failed, using localStorage:', err.message);
      try {
        var log = JSON.parse(localStorage.getItem('sierra_career_apps') || '[]');
        log.push(Object.assign({ id: 'local-' + Date.now() }, payload));
        localStorage.setItem('sierra_career_apps', JSON.stringify(log));
      } catch (e) {}
      return { id: 'local-' + Date.now(), fallback: true };
    });
  }

  // ── Subscribe to compounds (live updates) ──
  // Returns an unsubscribe function.
  function subscribe(callback) {
    if (!connected) {
      // Just call once with static data
      callback(D.compounds || []);
      return function () {};
    }
    return db.collection(COL.compounds).onSnapshot(function (snap) {
      var list = snap.docs.map(function (d) {
        var data = d.data();
        data.id = d.id;
        return data;
      });
      callback(list);
    }, function (err) {
      console.warn('[Sierra] subscribe failed, using static:', err.message);
      callback(D.compounds || []);
    });
  }

  // ── Seed Firestore from data.js (one-time, run from seed-firestore.html) ──
  function seedFromDataJS() {
    if (!connected) return Promise.reject(new Error('Firestore not connected'));
    var batch = db.batch();
    // Compounds
    (D.compounds || []).forEach(function (c) {
      var ref = db.collection(COL.compounds).doc(c.n.replace(/[^a-zA-Z0-9]/g, '_'));
      batch.set(ref, c);
    });
    // Listings
    (D.listings || []).forEach(function (l) {
      var ref = db.collection(COL.listings).doc(l.id ? String(l.id) : db.collection(COL.listings).doc().id);
      batch.set(ref, l);
    });
    return batch.commit().then(function () {
      console.info('[Sierra] Seeded ' + (D.compounds || []).length + ' compounds + ' + (D.listings || []).length + ' listings');
      return { compounds: (D.compounds || []).length, listings: (D.listings || []).length };
    });
  }

  // ═════════════════════════════════════════════════════════════════════════
  //  INIT + EXPORT
  // ═════════════════════════════════════════════════════════════════════════
  init();

  window.SIERRA_DB = {
    isReady: isReady,
    getCompounds: getCompounds,
    getCompound: getCompound,
    getUnitsFor: getUnitsFor,
    getListings: getListings,
    addInquiry: addInquiry,
    addCareerApp: addCareerApp,
    subscribe: subscribe,
    seedFromDataJS: seedFromDataJS,
    collections: COL
  };
})();
