/* ═══════════════════════════════════════════════════════════════════════════
 * Sierra Estates — Firebase Configuration
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  HOW TO GET THESE VALUES:
 *  1. Go to https://console.firebase.google.com
 *  2. Create a new project (or select existing one)
 *  3. Click the gear icon → "Project settings"
 *  4. Scroll down to "Your apps" → click the web icon (</>)
 *  5. Register your app (nickname: "Sierra Estates SE")
 *  6. Copy the config values shown into the placeholders below
 *  7. Go to "Build" → "Firestore Database" → "Create database" (production mode)
 *  8. Go to "Build" → "Authentication" → enable Email/Password + Google
 *
 *  SECURITY NOTE:
 *  The Firebase web config (apiKey, authDomain, etc.) is NOT secret — it's
 *  designed to be embedded in client-side code. Security is enforced by
 *  Firestore Security Rules (see firestore.rules). Never put server-side
 *  keys (like Gemini API key) here.
 *
 *  ⚠️  After filling in real values, this file CAN be committed to git.
 *      The config is safe to expose publicly (Firebase design pattern).
 * ═══════════════════════════════════════════════════════════════════════════ */

window.SIERRA_FIREBASE_CONFIG = {
  apiKey:            "PASTE-YOUR-API-KEY-HERE",
  authDomain:        "sierra-estates-XXXXX.firebaseapp.com",
  projectId:         "sierra-estates-XXXXX",
  storageBucket:     "sierra-estates-XXXXX.appspot.com",
  messagingSenderId: "000000000000",
  appId:             "1:000000000000:web:0000000000000000000000"
};

// Set to true ONLY after you've filled in real values above.
// While false, the site uses the static data.js fallback (no Firestore).
window.SIERRA_FIREBASE_ENABLED = false;
