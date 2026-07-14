import type { MetadataRoute } from 'next';

const BASE = 'https://sierra-estates.net';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/properties`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/compounds`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/virtual-tour`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
