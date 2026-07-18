import { Metadata } from 'next';
import HouzezPortal from '@/components/client/HouzezPortal';

export const metadata: Metadata = {
  title: 'Properties',
  description: 'Browse luxury properties in New Cairo with advanced search, filtering, and interactive map.',
  openGraph: {
    title: 'Luxury Properties · Sierra Estates',
    description: 'Discover premium properties with AI scoring and ROI analytics.',
    type: 'website',
  },
};

export default function PropertiesPage() {
  return (
    <main>
      <HouzezPortal />
    </main>
  );
}
