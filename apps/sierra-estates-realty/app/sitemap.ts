import type { MetadataRoute } from 'next';

const BASE = 'https://sierra-estates.net';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    // The client site is a single route (`/`); its sections are switched via the
    // `?view=` query param (see app/ClientApp.tsx), so the sitemap points there.
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/?view=properties`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/?view=compounds`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/?view=tour`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
