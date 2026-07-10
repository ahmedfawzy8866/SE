import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";

import { useProperties } from "../hooks/useListings";
import type { Property } from "../hooks/useListings";

interface Props {
  mode: string;
  selCmps: string[];
  rooms: number | null;
}

export default function Listings({ mode, selCmps, rooms }: Props) {
  const { t, lang } = useLang();
  const [sort, setSort] = useState("ai");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { data, total, loading } = useProperties(mode, selCmps, rooms, sort);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <section id="listings" style={{ background: "var(--ivory-dk)", padding: "90px 0" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, gap: 12, flexWrap: "wrap" }}>
          <div className="rv">
            <div className="sec-eyebrow">{t("listings.eyebrow")}</div>
            <h2 className="sec-title" style={{ marginBottom: 4 }}>
              {loading ? "—" : total} {t("listings.title")}
            </h2>
            <p style={{ fontSize: 11, color: "var(--text-f)", fontFamily: "var(--font-mono)", letterSpacing: ".08em" }}>
              Sourced via Sierra Intelligence · AI-ranked
            </p>
          </div>
          <div className="l-toolbar rv" style={{ marginBottom: 0 }}>
            <select className="l-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="ai">{t("listings.sort.ai")}</option>
              <option value="priceLow">{t("listings.sort.priceLow")}</option>
              <option value="priceHigh">{t("listings.sort.priceHigh")}</option>
              <option value="area">{t("listings.sort.area")}</option>
            </select>
            {(["grid","list"] as const).map(v => (
              <button key={v} className={`vbtn${view === v ? " on" : ""}`} onClick={() => setView(v)} aria-label={v}>
                {v === "grid"
                  ? <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M1 2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1zM1 7a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1zM1 12a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1z"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M2.5 12a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5z"/></svg>
                }
              </button>
            ))}
          </div>
        </div>

        {/* Grid / List */}
        {loading ? (
          <div className={view === "list" ? undefined : "l-grid"} style={view === "list" ? { display: "flex", flexDirection: "column", gap: 14 } : undefined}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 18, overflow: "hidden", background: "var(--white)", boxShadow: "0 2px 12px rgba(10,26,43,.06)", height: view === "grid" ? 420 : 160 }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg, #ece9e2 25%, #f5f2eb 50%, #ece9e2 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite" }} />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--text-m)" }}>
            No properties found for current filters.
          </div>
        ) : (
          <motion.div 
            variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            className={view === "list" ? undefined : "l-grid"}
            style={view === "list" ? { display: "flex", flexDirection: "column", gap: 14 } : undefined}
          >
            {data.map((p, i) => (
              <motion.div key={p.id} variants={itemVariants}>
                <ListingCard
                  property={p}
                  mode={mode}
                  view={view}
                  lang={lang}
                  delay={i % 6}
                  hovered={hoveredId === p.id}
                  onHover={setHoveredId}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function formatPrice(price: number, purpose: string): string {
  if (purpose === "for-rent") return `EGP ${(price / 1000).toFixed(0)}K/mo`;
  if (price >= 1_000_000) return `EGP ${(price / 1_000_000).toFixed(1)}M`;
  return `EGP ${(price || 0).toLocaleString()}`;
}

const CAT_ICONS: Record<string, string> = {
  villa: "🏡", penthouse: "🌇", apartment: "🏢",
  "twin-house": "🏠", townhouse: "🏘️", duplex: "🏗️",
};

function ListingCard({
  property: p, mode, view, lang, delay, hovered, onHover
}: {
  property: Property; mode: string; view: string; lang: string;
  delay: number; hovered: boolean; onHover: (id: string | null) => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAr = lang === "ar";

  const title = (isAr && p.titleAr ? p.titleAr : p.title) || "Unknown Property";
  const priceStr = formatPrice(p.price, p.purpose);
  const catIcon = CAT_ICONS[p.propertyType] ?? "🏠";
  const images = p.images || [];
  const tags = p.amenities || [];

  // Cycle images on hover
  useEffect(() => {
    if (hovered && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setImgIdx(i => (i + 1) % images.length);
      }, 1200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setImgIdx(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [hovered, images.length]);

  if (view === "list") {
    return (
      <div className={`lc rv rv-d${Math.min(delay, 5)}`}
        style={{ display: "flex", flexDirection: "row", overflow: "hidden" }}
        onMouseEnter={() => onHover(p.id)}
        onMouseLeave={() => onHover(null)}>
        <div style={{ width: 220, flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <img src={images[imgIdx] || "/estate.png"} alt={title} loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity .5s", minHeight: 160 }} />
        </div>
        <div className="lc-body" style={{ display: "flex", alignItems: "center", flex: 1, gap: 20, flexWrap: "wrap", padding: "16px 20px" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div className="lc-cmp">{p.compound}</div>
            <div className="lc-title">{title}</div>
          </div>
          <div className="lc-specs" style={{ flex: 1, minWidth: 200 }}>
            {[[p.bedrooms, "Beds"], [p.bathrooms, "Baths"], [p.area, "sqm"]].map(([v, l], i) => (
              <div key={i} className="lc-spec">
                <span className="lc-sv">{v}</span>
                <span className="lc-sl">{l}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div className="lc-price">{priceStr}</div>
            <button style={{ padding: "8px 18px", borderRadius: 8, background: "var(--navy)", color: "#fff", fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              💬 Inquire
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`lc rv rv-d${Math.min(delay, 5)}`}
      onMouseEnter={() => onHover(p.id)}
      onMouseLeave={() => onHover(null)}>
      <div className="lc-img-wrap">
        <img src={images[imgIdx] || "/estate.png"} alt={title} loading="lazy"
          style={{ transition: "opacity .5s" }} />

        {/* Category icon */}
        <div style={{ position: "absolute", bottom: 10, left: 10, zIndex: 5, background: "rgba(0,0,0,.5)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "4px 8px", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}>
          <span>{catIcon}</span>
          <span style={{ fontSize: 8.5, color: "rgba(255,255,255,.8)", fontWeight: 600, textTransform: "capitalize" }}>{p.propertyType}</span>
        </div>

        {/* Image dots */}
        {images.length > 1 && (
          <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4, zIndex: 5 }}>
            {images.map((_, i) => (
              <div key={i} style={{ width: i === imgIdx ? 14 : 5, height: 5, borderRadius: 3, background: i === imgIdx ? "var(--gold)" : "rgba(255,255,255,.4)", transition: "all .3s" }} />
            ))}
          </div>
        )}

        <div className="lc-view"><span>View Details</span></div>
      </div>

      <div className="lc-body">
        <div className="lc-cmp">{p.compound}</div>
        <div className="lc-title">{title}</div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", margin: "8px 0" }}>
          {tags.slice(0, 3).map((tag, i) => (
            <span key={i} style={{ fontSize: 8, padding: "2px 7px", borderRadius: 10, background: "rgba(0,45,98,.06)", border: "1px solid rgba(211,167,71,.15)", color: "var(--text-m)", fontWeight: 600 }}>{tag}</span>
          ))}
        </div>

        <div className="lc-specs">
          {[[p.bedrooms, "Beds"], [p.bathrooms, "Baths"], [p.area, "sqm"]].map(([v, l], i) => (
            <div key={i} className="lc-spec">
              <span className="lc-sv">{v}</span>
              <span className="lc-sl">{l}</span>
            </div>
          ))}
        </div>

        <div className="lc-price">{priceStr}</div>

        <button style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 9, background: "var(--navy)", color: "#fff", fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .25s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg,var(--gold),var(--gold-lt))"; (e.currentTarget as HTMLButtonElement).style.color = "var(--navy)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--navy)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}>
          <span style={{ fontSize: 14 }}>💬</span> Request Info
        </button>
      </div>
    </div>
  );
}
