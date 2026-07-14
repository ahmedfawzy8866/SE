import type { MetadataRoute } from 'next';

const BASE = 'https://sierra-estates.net';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // The client site is a single page (`/`) that contains every section
  // (properties, compounds, virtual tour) as in-page anchors — see
  // app/client/HomePortal.tsx. Only `/` is a real crawlable URL.
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
  ];
}
