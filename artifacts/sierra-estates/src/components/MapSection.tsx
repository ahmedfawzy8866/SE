import { useEffect, useRef, useState, useMemo } from "react";
import { useLang } from "@/contexts/LanguageContext";
import "leaflet/dist/leaflet.css";
import { useProperties, Property } from "@/hooks/useListings";
import { motion, AnimatePresence } from "framer-motion";

function formatPrice(price: number, currency: string | undefined): string {
  if (currency?.includes("month")) return `EGP ${(price / 1000).toFixed(0)}K/mo`;
  if (price >= 1_000_000) return `EGP ${(price / 1_000_000).toFixed(1)}M`;
  return `EGP ${(price || 0).toLocaleString()}`;
}

const BASE_COMPOUNDS = [
  { name: "Uptown Cairo", lat: 29.9817, lng: 31.4326 },
  { name: "Hyde Park", lat: 30.0256, lng: 31.4719 },
  { name: "Mountain View iCity", lat: 30.0388, lng: 31.4843 },
  { name: "Mivida", lat: 30.0210, lng: 31.4564 },
  { name: "Madinaty", lat: 30.1015, lng: 31.5992 },
  { name: "Eastown", lat: 30.0190, lng: 31.4620 },
  { name: "Palm Hills NC", lat: 30.0330, lng: 31.4780 },
  { name: "Villette", lat: 30.0285, lng: 31.4882 },
  { name: "Fifth Square", lat: 30.0180, lng: 31.4790 },
  { name: "SODIC East", lat: 30.0620, lng: 31.6180 },
  { name: "Taj City", lat: 30.0442, lng: 31.4512 },
  { name: "Bloomfields", lat: 30.0588, lng: 31.5640 },
  { name: "Sarai", lat: 30.0710, lng: 31.6420 },
  { name: "Al Rehab", lat: 30.0600, lng: 31.4970 },
  { name: "Katameya Heights", lat: 29.9958, lng: 31.4358 },
  { name: "La Vista City", lat: 30.0890, lng: 31.6888 },
  { name: "Zed East", lat: 30.0355, lng: 31.6025 },
  { name: "New Capital Phase 1", lat: 30.0250, lng: 31.7398 },
  { name: "New Capital City Centre", lat: 30.0080, lng: 31.7820 },
];

export default function MapSection() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const mapRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  const [darkMode, setDarkMode] = useState(false);
  const [zoom, setZoom] = useState(11);
  const [selCompound, setSelCompound] = useState<string | null>(null);

  // Filters State
  const [filterMode, setFilterMode] = useState("all");
  const [filterBudget, setFilterBudget] = useState<number>(100000000); // max budget
  const [filterBeds, setFilterBeds] = useState<number | null>(null);

  // Fetch all properties to compute map data dynamically
  const { data: allListings } = useProperties("all", [], null, "ai");

  // Filter listings based on map filters
  const filteredListings = useMemo(() => {
    let res = allListings;
    if (filterMode === "rent") res = res.filter(p => p.purpose === "for-rent");
    if (filterMode === "resale") res = res.filter(p => p.purpose === "for-sale");
    if (filterBeds) res = res.filter(p => p.bedrooms === filterBeds);
    res = res.filter(p => p.price <= filterBudget);
    return res;
  }, [allListings, filterMode, filterBudget, filterBeds]);

  // Aggregate stats per compound
  const compoundStats = useMemo(() => {
    const stats: Record<string, { units: number; minPrice: number; avgScore: number; listings: Property[] }> = {};
    BASE_COMPOUNDS.forEach(c => {
      stats[c.name] = { units: 0, minPrice: Infinity, avgScore: 0, listings: [] };
    });

    filteredListings.forEach(p => {
      const cName = BASE_COMPOUNDS.find(c => p.compound?.toLowerCase().includes(c.name.toLowerCase()))?.name;
      if (cName) {
        stats[cName].units += 1;
        stats[cName].listings.push(p);
        if (p.price < stats[cName].minPrice) stats[cName].minPrice = p.price;
        stats[cName].avgScore += p.ai_score || 8.5;
      }
    });

    // Finalize averages
    Object.keys(stats).forEach(k => {
      if (stats[k].units > 0) {
        stats[k].avgScore = Number((stats[k].avgScore / stats[k].units).toFixed(1));
      } else {
        stats[k].avgScore = 8.5; // fallback score
        stats[k].minPrice = 0;
      }
    });
    return stats;
  }, [filteredListings]);

  const activeCompoundListings = selCompound ? compoundStats[selCompound]?.listings || [] : [];

  // Initialize Map
  useEffect(() => {
    import("leaflet").then(mod => {
      const L = mod.default ?? mod as unknown as typeof import("leaflet");
      if (!mapRef.current || leafRef.current) return;

      const map = L.map(mapRef.current, {
        center: [30.022, 31.610],
        zoom: 11,
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
      });
      leafRef.current = map;
      markerGroupRef.current = L.layerGroup().addTo(map);

      map.on("zoomend", () => setZoom(map.getZoom()));

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
      }).addTo(map);

      map.fitBounds([[29.97, 31.40], [30.12, 31.82]], { padding: [40, 40] });
    });

    return () => {
      leafRef.current?.remove();
      leafRef.current = null;
    };
  }, []);

  // Update Markers when filters change
  useEffect(() => {
    if (!leafRef.current || !markerGroupRef.current) return;
    import("leaflet").then(mod => {
      const L = mod.default ?? mod as unknown as typeof import("leaflet");
      const group = markerGroupRef.current!;
      group.clearLayers();

      BASE_COMPOUNDS.forEach(c => {
        const stats = compoundStats[c.name];
        if (stats.units === 0) return; // Hide marker if no units match

        const score = stats.avgScore;
        const isTop = score >= 9.2;
        const colorMain = isTop ? "#D3A747" : "#34D399";
        const priceStr = formatPrice(stats.minPrice, "EGP");

        const icon = L.divIcon({
          className: "",
          html: `
            <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
              <div style="min-width:62px;padding:4px 10px;background:rgba(0,45,98,.93);backdrop-filter:blur(8px);border:1.5px solid ${colorMain};border-radius:22px;font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:700;color:${colorMain};text-align:center;white-space:nowrap;box-shadow:0 4px 18px rgba(0,0,0,.3);cursor:pointer;line-height:1.4;transition:all .22s;">
                <span style="color:#fff;margin-right:4px;">${stats.units}</span> ${priceStr}
                <div style="font-size:7px;color:rgba(255,255,255,.45);font-weight:400;margin-top:1px;">${c.name}</div>
              </div>
              ${isTop ? `<div style="position:absolute;inset:-5px;border-radius:26px;border:2px solid ${colorMain};animation:cmRing 2.4s ease-out infinite;pointer-events:none;"></div>` : ""}
            </div>`,
          iconSize: [80, 44],
          iconAnchor: [40, 22],
        });

        const marker = L.marker([c.lat, c.lng], { icon });
        marker.addTo(group);
        marker.on("click", () => {
          setSelCompound(c.name);
          leafRef.current?.flyTo([c.lat, c.lng], 13, { duration: 1.2 });
        });
        marker.bindTooltip(`<b>${c.name}</b><br/>${stats.units} available units`, {
          direction: "top", offset: [0, -28],
          className: "se-tooltip",
        });
      });
    });
  }, [compoundStats]);

  useEffect(() => {
    const el = mapRef.current?.querySelector(".leaflet-tile-pane") as HTMLElement;
    if (el) el.style.filter = darkMode ? "brightness(.68) saturate(.85) hue-rotate(185deg)" : "";
  }, [darkMode]);

  const handleZoom = (dir: "in" | "out") => {
    const map = leafRef.current;
    if (!map) return;
    if (dir === "in") map.zoomIn();
    else map.zoomOut();
  };

  return (
    <section id="map" style={{ background: "var(--ivory)", padding: "90px 0" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}
        >
          <div>
            <div className="sec-eyebrow">Map Intelligence</div>
            <h2 className="sec-title" style={{ marginBottom: 0 }}>Interactive Map View</h2>
            <p className="sec-sub" style={{ marginBottom: 0, marginTop: 8, maxWidth: 480 }}>
              Filter and explore {filteredListings.length} available units across New Cairo and the New Capital.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setDarkMode(d => !d)} style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid var(--border)", background: darkMode ? "rgba(0,45,98,.08)" : "var(--white)", fontSize: 11, fontWeight: 600, color: "var(--navy)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {darkMode ? "☀️ Light" : "🌙 Dark"} Map
            </button>
            <button onClick={() => { leafRef.current?.flyTo([30.022, 31.610], 11, { duration: 1.2 }); setSelCompound(null); }} style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--white)", fontSize: 11, fontWeight: 600, color: "var(--text-m)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              ⊙ Reset View
            </button>
          </div>
        </motion.div>

        <div style={{ display: "flex", gap: 24, flexDirection: "row", alignItems: "flex-start" }}>
          
          {/* Main Map Area */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ flex: 1, position: "relative", borderRadius: 20, overflow: "hidden", boxShadow: "0 16px 56px rgba(10,26,43,.16), 0 0 0 1px rgba(211,167,71,.15)", height: 600, width: "100%" }}
          >
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

            {/* Custom Zoom Buttons */}
            <div style={{ position: "absolute", top: 14, right: 14, zIndex: 900, display: "flex", flexDirection: "column", gap: 4 }}>
              {[ { label: "+", dir: "in"  as const }, { label: "−", dir: "out" as const } ].map(({ label, dir }) => (
                <button
                  key={dir} onClick={() => handleZoom(dir)}
                  style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.97)", border: "1.5px solid rgba(211,167,71,.3)", color: "var(--navy)", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(10,26,43,.15)", transition: "all .2s" }}
                >
                  {label}
                </button>
              ))}
              <div style={{ width: 36, height: 26, borderRadius: 8, background: "rgba(0,45,98,.85)", border: "1px solid rgba(211,167,71,.25)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                <span style={{ fontSize: 8.5, fontFamily: "var(--font-mono)", color: "var(--gold)", fontWeight: 600 }}>{zoom}×</span>
              </div>
            </div>

            {/* Spreadsheet Data View Overlay */}
            <AnimatePresence>
              {selCompound && (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                  style={{ position: "absolute", top: 14, left: 14, bottom: 14, zIndex: 1000, width: 340, background: "rgba(255,255,255,.98)", backdropFilter: "blur(20px)", border: "1px solid rgba(211,167,71,.28)", borderRadius: 16, display: "flex", flexDirection: "column", boxShadow: "0 14px 44px rgba(10,26,43,.18)" }}
                >
                  <div style={{ padding: 16, borderBottom: "1px solid rgba(0,0,0,.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", margin: 0, fontFamily: "var(--font-serif)" }}>{selCompound}</h3>
                      <div style={{ fontSize: 11, color: "var(--text-m)", marginTop: 2 }}>{activeCompoundListings.length} Available Units</div>
                    </div>
                    <button onClick={() => setSelCompound(null)} style={{ background: "rgba(0,0,0,.05)", border: "none", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)" }}>✕</button>
                  </div>
                  
                  <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    {activeCompoundListings.map(unit => (
                      <div key={unit.id} style={{ background: "rgba(0,45,98,.02)", border: "1px solid rgba(0,0,0,.05)", borderRadius: 10, padding: 12, cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--gold)"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(0,0,0,.05)"}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--navy)", lineHeight: 1.2 }}>{(isAr ? unit.titleAr : unit.title) || 'Unit'}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gold-dk)", whiteSpace: "nowrap" }}>{formatPrice(unit.price, unit.currency)}</div>
                        </div>
                        <div style={{ display: "flex", gap: 12, fontSize: 10, color: "var(--text-f)" }}>
                          <span>{unit.bedrooms} Beds</span>
                          <span>{unit.bathrooms} Baths</span>
                          <span>{unit.area} m²</span>
                        </div>
                      </div>
                    ))}
                    {activeCompoundListings.length === 0 && (
                      <div style={{ padding: 24, textAlign: "center", fontSize: 12, color: "var(--text-f)" }}>No units match current filters.</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>

          {/* Advanced Filter Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            style={{ width: 280, background: "var(--white)", borderRadius: 20, padding: 20, boxShadow: "0 8px 32px rgba(10,26,43,.06)", border: "1px solid var(--border)", flexShrink: 0 }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 16, fontFamily: "var(--font-serif)" }}>Advanced Filters</h3>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-m)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Listing Type</label>
              <div style={{ display: "flex", gap: 6, background: "rgba(0,45,98,.04)", padding: 4, borderRadius: 8 }}>
                {["all", "resale", "rent"].map(m => (
                  <button key={m} onClick={() => setFilterMode(m)} style={{ flex: 1, padding: "6px 0", fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: "pointer", border: "none", background: filterMode === m ? "var(--white)" : "transparent", color: filterMode === m ? "var(--navy)" : "var(--text-m)", boxShadow: filterMode === m ? "0 2px 8px rgba(0,0,0,.08)" : "none", transition: "all .2s", textTransform: "capitalize" }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-m)", textTransform: "uppercase", letterSpacing: ".05em" }}>Max Budget</label>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--navy)" }}>{formatPrice(filterBudget, "EGP")}</span>
              </div>
              <input type="range" min={1000000} max={100000000} step={1000000} value={filterBudget} onChange={(e) => setFilterBudget(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--gold)" }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-m)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Bedrooms</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {[1, 2, 3, 4, 5, 6].map(b => (
                  <button key={b} onClick={() => setFilterBeds(filterBeds === b ? null : b)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${filterBeds === b ? "var(--gold)" : "rgba(0,0,0,.08)"}`, background: filterBeds === b ? "rgba(211,167,71,.1)" : "var(--white)", color: filterBeds === b ? "var(--gold-dk)" : "var(--text-m)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-m)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Nearby Landmarks</label>
              <select style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,.1)", fontSize: 12, outline: "none", cursor: "pointer", color: "var(--text)" }}>
                <option value="all">Any Landmark</option>
                <option value="auc">AUC (New Cairo)</option>
                <option value="airport">Cairo Int. Airport</option>
                <option value="iconic">Iconic Tower (New Capital)</option>
              </select>
            </div>
            
          </motion.div>
        </div>
      </div>

      <style>{`
        .se-tooltip { background: var(--navy) !important; border: 1px solid rgba(211,167,71,.35) !important; color: #fff !important; font-family: 'Inter', sans-serif !important; font-size: 11px !important; border-radius: 9px !important; padding: 6px 10px !important; box-shadow: 0 8px 24px rgba(0,0,0,.28) !important; }
        .se-tooltip b { color: var(--gold) !important; }
        .se-tooltip::before { border-top-color: rgba(211,167,71,.35) !important; }
        .leaflet-control-attribution { display: none !important; }
        @keyframes cmRing { 0% { transform: scale(1); opacity: .6; } 100% { transform: scale(1.7); opacity: 0; } }
        @media(max-width:900px){ div[style*="flexDirection: \"row\""]{ flexDirection: column !important; } div[style*="width: 280"] { width: 100% !important; } }
      `}</style>
    </section>
  );
}
