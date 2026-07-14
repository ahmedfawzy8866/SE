"use client";
/**
 * Hero — full-bleed carousel with search overlay.
 * Rotates 5 slides (from existing data.js). The SearchBar is overlaid
 * at the bottom; on submit, scrolls to #listings with the filters
 * applied (the ListingsGrid component reads them from URL hash).
 */
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Building2 } from "lucide-react";
import { useI18n } from "@/lib/i18n-client";
import { SearchBar } from "./SearchBar";
import type { SearchFilters } from "./SearchBar";

const SLIDES = [
  { img: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=85", eyebrow: "FIRST & ONLY WEBSITE IN EGYPT DESIGNED FOR NEW CAIRO", title: "The First Exclusive Destination for New Cairo Properties", subtitle: "Rent & Resale. AI-driven matches. Curated compounds." },
  { img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=85", eyebrow: "BEST-IN-CLASS DESIGN", title: "Redefining Luxury Living with AI-Driven Excellence", subtitle: "Smart matches. Smart investments. Smarter decisions." },
  { img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85", eyebrow: "AI-DRIVEN EXCELLENCE", title: "Smart Matches for Smart Investors", subtitle: "Our AI scores every listing on 12 dimensions — you see only the top." },
  { img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920&q=85", eyebrow: "EXCLUSIVE NETWORK", title: "Unrivaled Access to Premium Compounds", subtitle: "52 New Cairo compounds. From Mivida to Hyde Park to Taj City." },
  { img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=85", eyebrow: "CURATED PORTFOLIO", title: "Your Journey to Exceptional Homes Begins Here", subtitle: "Hand-verified listings. Ready to tour. Concierge at your service." },
];

export function Hero({ onSearch }: { onSearch: (f: SearchFilters) => void }) {
  const { t } = useI18n();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[idx];

  return (
    <section className="relative h-[88vh] min-h-[640px] w-full overflow-hidden">
      {/* Background slides */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: i === idx ? 1 : 0,
            backgroundImage: `url(${s.img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-950/40 to-navy-950/80" />

      {/* Content */}
      <div className="relative h-full container-page flex flex-col justify-end pb-24 pt-32">
        <div className="max-w-3xl text-cream">
          <p className="section-eyebrow !text-gold-300 mb-3">{slide.eyebrow}</p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] mb-4">
            {slide.title}
          </h1>
          <p className="text-lg text-cream/80 max-w-2xl">{slide.subtitle}</p>

          <div className="flex flex-wrap gap-3 mt-6">
            <a href="#listings" className="btn-gold">
              <Building2 className="h-4 w-4" />
              {t("hero.cta.browse")}
            </a>
            <a href="#match" className="btn-outline !text-cream !border-cream/30 hover:!bg-cream/10">
              <Sparkles className="h-4 w-4" />
              {t("hero.cta.match")}
            </a>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-8">
          <SearchBar onSearch={onSearch} />
        </div>
      </div>

      {/* Slide controls */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2 z-10">
        <button onClick={() => setIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length)} className="h-9 w-9 rounded-full glass text-cream flex items-center justify-center hover:bg-cream/10">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-8 bg-gold-400" : "w-2 bg-cream/40"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <button onClick={() => setIdx((i) => (i + 1) % SLIDES.length)} className="h-9 w-9 rounded-full glass text-cream flex items-center justify-center hover:bg-cream/10">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
