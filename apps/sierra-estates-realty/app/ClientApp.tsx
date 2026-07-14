'use client';

/* ============================================================================
   SIERRA ESTATES — UNIFIED CLIENT PAGE
   Single client-facing route (`/`). All formerly-separate client routes
   (home, properties, compounds, property detail, virtual tour) are merged
   into this one page and switched via the `?view=` query param so deep-links
   stay shareable:

     /                         → home
     /?view=properties         → properties listing
     /?view=compounds          → compounds intelligence
     /?view=property&id=<id>   → single property detail
     /?view=tour               → virtual tour

   The individual view components live in ./client (properties/compounds/…) and
   ./ClientHome (homepage) — this file is the router shell that composes them.
   ============================================================================ */

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientHome from './ClientHome';
import PropertiesPortal from './client/PropertiesPortal';
import CompoundsPortal from './client/CompoundsPortal';
import PropertyDetail from './client/PropertyDetail';
import VirtualTourPortal from './client/VirtualTourPortal';
import './client/houzez.css';

// Per-view <title> so each view keeps the title its old route used to set.
const TITLES: Record<string, string> = {
  home: 'Sierra Estates — Luxury Real Estate in New Cairo',
  properties: 'Sierra Estates · Properties',
  compounds: 'Sierra Estates · Compounds',
  property: 'Sierra Estates · Property',
  tour: 'Sierra Estates · Virtual Tour',
};

export default function ClientApp() {
  const params = useSearchParams();
  const view = params.get('view') || 'home';
  const id = params.get('id') || '';

  useEffect(() => {
    const title = TITLES[view] || TITLES.home;
    if (typeof document !== 'undefined') document.title = title;
  }, [view]);

  switch (view) {
    case 'properties':
      return <PropertiesPortal />;
    case 'compounds':
      return <CompoundsPortal />;
    case 'property':
      return <PropertyDetail id={id} />;
    case 'tour':
      return <VirtualTourPortal />;
    case 'home':
    default:
      return <ClientHome />;
  }
}
