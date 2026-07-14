import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/client/Toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "Sierra Estates · New Cairo Properties",
    template: "%s · Sierra Estates",
  },
  description:
    "The first exclusive destination for New Cairo properties. Rent & resale, AI-driven matches, 52 curated compounds.",
  metadataBase: new URL("https://sierra-estates.net"),
  keywords: [
    "New Cairo", "real estate", "compounds", "5th Settlement",
    "Mivida", "Hyde Park", "villas", "apartments", "Egypt property",
  ],
  openGraph: {
    title: "Sierra Estates · New Cairo Properties",
    description: "AI-driven real-estate portal for New Cairo compounds.",
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_EG",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0d2136",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <I18nProvider>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
