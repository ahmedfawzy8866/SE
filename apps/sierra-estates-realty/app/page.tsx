import type { Metadata } from 'next';
import { Suspense } from 'react';
import ClientApp from './ClientApp';
import { SiteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Sierra Estates — Luxury Real Estate in New Cairo',
  description:
    '19 compounds, 1,200+ verified units across New Cairo. AI-curated matches, on-site verified inventory, human-closed deals.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Sierra Estates — Luxury Real Estate in New Cairo',
    description:
      'AI-curated, on-site verified property inventory across New Cairo compounds. Rent & resale.',
    url: '/',
    siteName: 'Sierra Estates',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_EG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sierra Estates — Luxury Real Estate in New Cairo',
    description: 'AI-curated, verified property inventory across New Cairo compounds.',
  },
};

// Structured data so search engines classify the site as a real-estate agency.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Sierra Estates',
  url: 'https://sierra-estates.net',
  areaServed: 'New Cairo, Egypt',
  address: { '@type': 'PostalAddress', addressLocality: 'New Cairo', addressCountry: 'EG' },
  sameAs: [SiteConfig.contact.whatsapp],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Suspense fallback={null}>
        <ClientApp />
      </Suspense>
    </>
  );
}
