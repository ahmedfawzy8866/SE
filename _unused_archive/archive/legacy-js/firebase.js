/* ═══════════════════════════════════════════════════════════════════════════
 * Sierra Estates — Firebase Integration Layer (LIVE PORTAL)
 * File: firebase.js
 * ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var D = window.HZDATA;
  var db = null;
  var connected = false;

  function init() {
    if (!window.SIERRA_FIREBASE_ENABLED) return false;
    if (!window.firebase || !window.SIERRA_FIREBASE_CONFIG) return false;
    var cfg = window.SIERRA_FIREBASE_CONFIG;
    try {
      // Check if app already initialized (prevents duplicate-app error)
      try {
        firebase.app();
      } catch (e) {
        firebase.initializeApp(cfg);
      }
      db = firebase.firestore();
      connected = true;
      // Google Analytics (optional) — only when a measurementId is configured
      // and the analytics-compat SDK is present. Guarded so a missing id/SDK
      // never blocks Firestore.
      try {
        if (cfg.measurementId && firebase.analytics) firebase.analytics();
      } catch (e) { /* analytics is best-effort */ }
      if (window.console) console.info('[Sierra] Firebase connected to project:', cfg.projectId);
      return true;
    } catch (e) {
      if (window.console) console.warn('[Sierra] Firebase init failed, using static fallback:', e.message);
      return false;
    }
  }

  function isReady() { return connected; }

  function getCompounds() {
    if (!connected) return Promise.resolve(D.compounds || []);
    return db.collection('compounds').get().then(function (snap) {
      return snap.docs.map(function (d) { var data = d.data(); data.id = d.id; return data; });
    }).catch(function () { return D.compounds || []; });
  }

  function getUnitsFor(name) {
    if (!connected) return Promise.resolve(D.unitsFor ? D.unitsFor(name) : []);
    return db.collection('units').where('compound', '==', name).get().then(function (snap) {
      if (snap.empty) return D.unitsFor ? D.unitsFor(name) : [];
      return snap.docs.map(function (d) { var data = d.data(); data.id = d.id; return data; });
    }).catch(function () { return D.unitsFor ? D.unitsFor(name) : []; });
  }

  function addInquiry(data) {
    var payload = {
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      mode: data.mode || 'buy',
      name: data.name || '', phone: data.phone || '', email: data.email || '',
      zone: data.zone || '', type: data.type || '', budget: data.budget || '',
      status: 'new', source: 'website'
    };
    if (!connected) {
      try {
        var log = JSON.parse(localStorage.getItem('sierra_inquiries') || '[]');
        log.push(Object.assign({ id: 'local-' + Date.now() }, payload));
        localStorage.setItem('sierra_inquiries', JSON.stringify(log));
      } catch (e) {}
      return Promise.resolve({ id: 'local-' + Date.now(), fallback: true });
    }
    return db.collection('inquiries').add(payload).then(function (ref) {
      return { id: ref.id, fallback: false };
    }).catch(function () {
      try {
        var log = JSON.parse(localStorage.getItem('sierra_inquiries') || '[]');
        log.push(Object.assign({ id: 'local-' + Date.now() }, payload));
        localStorage.setItem('sierra_inquiries', JSON.stringify(log));
      } catch (e) {}
      return { id: 'local-' + Date.now(), fallback: true };
    });
  }

  function addCareerApp(data) {
    var payload = {
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      name: data.name || '', phone: data.phone || '', email: data.email || '',
      position: data.position || '', experience: data.experience || '',
      message: data.message || '', status: 'new'
    };
    if (!connected) {
      try {
        var log = JSON.parse(localStorage.getItem('sierra_career_apps') || '[]');
        log.push(Object.assign({ id: 'local-' + Date.now() }, payload));
        localStorage.setItem('sierra_career_apps', JSON.stringify(log));
      } catch (e) {}
      return Promise.resolve({ id: 'local-' + Date.now(), fallback: true });
    }
    return db.collection('career_applications').add(payload).then(function (ref) {
      return { id: ref.id, fallback: false };
    }).catch(function () { return { id: 'local-' + Date.now(), fallback: true }; });
  }

  init();

  window.SIERRA_DB = {
    isReady: isReady,
    getCompounds: getCompounds,
    getUnitsFor: getUnitsFor,
    addInquiry: addInquiry,
    addCareerApp: addCareerApp
  };
})();
