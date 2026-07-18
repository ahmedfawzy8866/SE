import type { Metadata } from 'next';
import { Providers } from '../components/Providers';
import './globals.css';
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: 'Sierra Estates | Luxury Real Estate Portal',
  description:
    'Sierra Estates — AI-curated luxury properties in New Cairo. Rent, resale, and exclusive off-plan listings with 3D virtual tours.',
  keywords: ['real estate', 'luxury', 'Egypt', 'New Cairo', 'Sierra Estates', 'Houyez'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Sierra Estates',
    description: 'AI-curated luxury real estate in New Cairo',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_EG',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&family=Cairo:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <Providers>
          <main id="main-content">{children}</main>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
