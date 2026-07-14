import './client/houzez.css';
import HomePortal from './client/HomePortal';

export const metadata = {
  title: 'Sierra Estates · Luxury Real Estate in New Cairo',
  description:
    'AI-driven luxury real estate for New Cairo — 1,200+ verified units across 19 compounds. AI-curated matches, human-closed deals. First match to signed contract in as little as 48 hours.',
  metadataBase: new URL('https://sierra-estates.net'),
  openGraph: {
    title: 'Sierra Estates · Luxury Real Estate in New Cairo',
    description:
      'AI-driven luxury real estate for New Cairo — 1,200+ verified units across 19 compounds.',
    url: 'https://sierra-estates.net',
    siteName: 'Sierra Estates',
    type: 'website',
  },
  alternates: {
    canonical: 'https://sierra-estates.net',
  },
};

export default function HomePage() {
  return <HomePortal />;
}
