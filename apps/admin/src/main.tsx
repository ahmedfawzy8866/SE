/**
 * Admin Dashboard - Main Entry Point
 * SIERRA ESTATES 3.0 — Intelligence OS
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdminFirebaseProvider } from './providers/FirebaseProvider';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdminFirebaseProvider>
      <App />
    </AdminFirebaseProvider>
  </React.StrictMode>,
);
