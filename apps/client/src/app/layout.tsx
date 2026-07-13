import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sierra Estates — New Cairo Properties',
  description: 'AI-driven real estate portal for New Cairo compounds. Browse verified listings, take 3D virtual tours, and get AI-matched properties.',
  keywords: ['New Cairo', 'real estate', 'compounds', 'Mivida', 'Hyde Park', 'villa', 'apartment'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
