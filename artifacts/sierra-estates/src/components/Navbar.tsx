import { useState, useEffect, useRef, useMemo } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useLocation } from "wouter";

const ALL_COMPOUNDS = [
  'Hyde Park','Mountain View iCity','Mountain View Hyde Park',
  'Uptown Cairo','Mivida','Madinaty','Eastown','El Shorouk',
  'Palm Hills NC','Villette','Fifth Square','SODIC East',
  'Taj City','Bloomfields','Sarai','Katameya Heights',
  'Al Rehab','Zed East','La Vista City',
];
const NEARBY = [
  'British International School Cairo','GEMS Cairo International',
  'Cairo American College','AUC New Cairo',
  'Cairo Festival City Mall','Point 90 Mall',
  'Waterway Restaurants','New Cairo Sporting Club',
  '5th Settlement Ring Road','Cairo Airport 30 min',
];

interface NavbarProps {
  mode: string;
  setMode: (m: string) => void;
  selCmps: string[];
  setSelCmps: (fn: (s: string[]) => string[]) => void;
  rooms: number | null;
  setRooms: (r: number | null) => void;
  matchCount: number;
  onSmartRequest: () => void;
  annVisible: boolean;
}

export default function Navbar({
  mode, setMode, selCmps, setSelCmps, rooms, setRooms,
  matchCount, onSmartRequest, annVisible,
}: NavbarProps) {
  const { t, toggleLang, isRTL } = useLang();
  const [open, setOpen] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cmpQ, setCmpQ] = useState("");
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();
  const pillRef = useRef<HTMLDivElement>(null);

  const topOffset = annVisible ? 36 : 0;

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggleCmp = (c: string) =>
    setSelCmps(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c]);

  const filtCmps = useMemo(() =>
    ALL_COMPOUNDS.filter(c => !cmpQ || c.toLowerCase().includes(cmpQ.toLowerCase()))
  , [cmpQ]);

  const cmpLbl = selCmps.length
    ? `${selCmps.length} Compound${selCmps.length > 1 ? "s" : ""}`
    : t("nav.compounds");
  const roomLbl = rooms ? `${rooms} Bed${rooms > 1 ? "s" : ""}` : t("nav.rooms");

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { key: "nav.home", href: "#hero" },
    { key: "nav.listings", href: "#listings" },
    { key: "nav.tour", href: "#tour" },
    { key: "nav.intel", href: "#intel" },
    { key: "nav.contact", href: "#contact" },
  ];

  return (
    <>
      <header className="hdr" style={{ top: topOffset }}>
        {/* Logo */}
        <a href="#hero" className="hdr-brand" onClick={e => { e.preventDefault(); scrollTo("#hero"); }}>
          <img src="/logo.jpg" alt="Sierra Estates" style={{ width: 34, height: 34, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
          <div>
            <div className="hdr-name">Sierra Estates</div>
            <div className="hdr-slogan">{isRTL ? "مستقبل العقارات" : "Future of Real Estates"}</div>
          </div>
        </a>

        {/* Center pill — desktop only */}
        <div className="hdr-center">
          <div className="hdr-pill" ref={pillRef}>
            <div className="hdr-seg">
              {(["all", "rent", "resale"] as const).map(k => (
                <button key={k} className={`hdr-mode${mode === k ? " on" : ""}`} onClick={() => setMode(k)}>
                  {t(`nav.${k}`)}
                </button>
              ))}
            </div>

            {/* Compound dropdown */}
            <div className="hdr-dd">
              <button className={`hdr-dd-btn${open === "cpd" ? " open" : ""}`}
                onClick={() => { setOpen(o => o === "cpd" ? null : "cpd"); setCmpQ(""); }}>
                ⊙ {cmpLbl} ▾
              </button>
              {open === "cpd" && (
                <div className="hdr-drop" style={{ width: 262 }}>
                  <input className="fdd-search" placeholder="Search compound…"
                    value={cmpQ} onChange={e => setCmpQ(e.target.value)}
                    onClick={e => e.stopPropagation()} autoFocus />
                  {selCmps.length > 0 && (
                    <button className="fdd-item" style={{ color: "var(--gold-dk)", fontSize: 10 }}
                      onClick={() => setSelCmps(() => [])}>
                      <span className="chk">×</span>Clear all ({selCmps.length})
                    </button>
                  )}
                  <div className="fdd-sep">New Cairo · {filtCmps.length} Compounds</div>
                  {filtCmps.map(c => (
                    <button key={c} className={`fdd-item${selCmps.includes(c) ? " sel" : ""}`} onClick={() => toggleCmp(c)}>
                      <span className="chk">{selCmps.includes(c) ? "✓" : ""}</span>{c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rooms dropdown */}
            <div className="hdr-dd">
              <button className={`hdr-dd-btn${open === "rooms" ? " open" : ""}`}
                onClick={() => setOpen(o => o === "rooms" ? null : "rooms")}>
                ⊟ {roomLbl} ▾
              </button>
              {open === "rooms" && (
                <div className="hdr-drop" style={{ width: 168 }}>
                  <button className={`fdd-item${!rooms ? " sel" : ""}`} onClick={() => setRooms(null)}>
                    <span className="chk">{!rooms ? "✓" : ""}</span>Any
                  </button>
                  {[1,2,3,4,5,6].map(r => (
                    <button key={r} className={`fdd-item${rooms === r ? " sel" : ""}`}
                      onClick={() => setRooms(rooms === r ? null : r)}>
                      <span className="chk">{rooms === r ? "✓" : ""}</span>{r} Bed{r > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nearby dropdown */}
            <div className="hdr-dd">
              <button className={`hdr-dd-btn${open === "near" ? " open" : ""}`}
                onClick={() => setOpen(o => o === "near" ? null : "near")}>
                ◎ {t("nav.nearby")} ▾
              </button>
              {open === "near" && (
                <div className="hdr-drop right" style={{ width: 246 }}>
                  <div className="fdd-sep">Schools &amp; Landmarks</div>
                  {NEARBY.map(n => (
                    <button key={n} className="fdd-item" onClick={() => setOpen(null)}>
                      <span className="chk" />
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="hdr-cta" onClick={() => { setOpen(null); setLocation("/request"); }}>
              {t("nav.cta")}
            </button>
          </div>
        </div>

        {/* Right controls */}
        <div className="hdr-right">
          <button className="hdr-icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Theme">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button className="hdr-icon" onClick={toggleLang} title="Language"
            style={{ fontSize: 11, fontFamily: "inherit", fontWeight: 700 }}>
            {t("nav.lang")}
          </button>
          <button onClick={() => setMenuOpen(true)} className="hdr-icon hdr-hamburger" aria-label="Menu">
            <Menu size={16} />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 900,
          background: "rgba(0,13,32,.97)", backdropFilter: "blur(16px)",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 28, padding: 32,
        }}>
          <button onClick={() => setMenuOpen(false)} style={{
            position: "absolute", top: 20, right: 24,
            background: "none", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer",
          }}><X size={28} /></button>
          {navLinks.map(l => (
            <button key={l.key} onClick={() => scrollTo(l.href)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 400,
                color: "rgba(255,255,255,.85)", letterSpacing: ".02em",
              }}>
              {t(l.key)}
            </button>
          ))}
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button onClick={() => { toggleLang(); setMenuOpen(false); }}
              style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid rgba(211,167,71,.4)", background: "none", color: "var(--gold-lt)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              {t("nav.lang")}
            </button>
            <button onClick={() => { setLocation("/request"); setMenuOpen(false); }}
              style={{ padding: "10px 24px", borderRadius: 9, background: "linear-gradient(135deg,var(--gold),var(--gold-lt))", color: "var(--navy)", fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              {t("nav.cta")}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .hdr-hamburger { display: none !important; }
        @media(max-width: 900px) {
          .hdr-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
