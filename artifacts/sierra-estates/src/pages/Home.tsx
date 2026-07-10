import { useState, useMemo, useEffect } from "react";
import AnnBar from "@/components/AnnBar";
import Navbar from "@/components/Navbar";
import SmartRequest from "@/components/SmartRequest";
import Hero from "@/components/Hero";
import Listings from "@/components/Listings";
import VirtualTour from "@/components/VirtualTour";
import MapSection from "@/components/MapSection";
import IntelligenceOS from "@/components/IntelligenceOS";
import WhySierra from "@/components/WhySierra";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AIChat from "@/components/AIChat";
import SecurityShield from "@/components/SecurityShield";

const ALL_CMP_COUNT = 19;

/* ── Global scroll-reveal observer ── */
function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.10, rootMargin: "0px 0px -30px 0px" }
    );
    const els = document.querySelectorAll(".rv, .rv-left, .rv-right, .rv-scale");
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ── Animated gold orb background for sections ── */
function GoldOrbs({ light = false }: { light?: boolean }) {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: light ? "radial-gradient(circle, rgba(211,167,71,.08) 0%, transparent 70%)" : "radial-gradient(circle, rgba(211,167,71,.12) 0%, transparent 70%)", top: "-20%", right: "-10%", animation: "orbFloat1 14s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", background: light ? "radial-gradient(circle, rgba(0,45,98,.05) 0%, transparent 70%)" : "radial-gradient(circle, rgba(211,167,71,.07) 0%, transparent 70%)", bottom: "5%", left: "-8%", animation: "orbFloat2 18s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(211,167,71,.06) 0%, transparent 70%)", top: "40%", left: "30%", animation: "orbFloat3 22s ease-in-out infinite" }} />
    </div>
  );
}

/* ── Section divider: animated gradient line ── */
function GoldLine() {
  return (
    <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--gold) 30%, var(--gold-lt) 50%, var(--gold) 70%, transparent)", opacity: .35, margin: 0 }} />
  );
}

export default function Home() {
  const [annVisible, setAnnVisible] = useState(true);
  const [mode, setMode] = useState("all");
  const [selCmps, setSelCmps] = useState<string[]>([]);
  const [rooms, setRooms] = useState<number | null>(null);
  const [smartOpen, setSmartOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useScrollReveal();

  const topOffset = annVisible ? 36 : 0;

  const matchCount = useMemo(() => {
    let n = ALL_CMP_COUNT;
    if (selCmps.length) n = Math.min(n, selCmps.length * 2);
    if (rooms) n = Math.max(1, Math.floor(n * 0.55));
    return n;
  }, [selCmps, rooms]);

  return (
    <div style={{ paddingTop: topOffset }}>
      <AnnBar
        visible={annVisible}
        onDismiss={() => setAnnVisible(false)}
        onClaim={() => setContactOpen(true)}
      />

      <Navbar
        mode={mode}
        setMode={setMode}
        selCmps={selCmps}
        setSelCmps={setSelCmps}
        rooms={rooms}
        setRooms={setRooms}
        matchCount={matchCount}
        onSmartRequest={() => setSmartOpen(o => !o)}
        annVisible={annVisible}
      />

      <SmartRequest
        visible={smartOpen}
        matchCount={matchCount}
        topOffset={topOffset}
        onClose={() => setSmartOpen(false)}
      />

      <div style={{ height: 58 }} />

      {/* ─ HERO ──────────────────────────────────────────────────────── */}
      <Hero />

      <GoldLine />

      {/* ─ LISTINGS ──────────────────────────────────────────────────── */}
      <div style={{ position: "relative", background: "var(--ivory)" }}>
        <GoldOrbs light />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Listings mode={mode} selCmps={selCmps} rooms={rooms} />
        </div>
      </div>

      <GoldLine />

      {/* ─ VIRTUAL TOUR ──────────────────────────────────────────────── */}
      <div style={{ position: "relative" }}>
        <GoldOrbs />
        <div style={{ position: "relative", zIndex: 1 }}>
          <VirtualTour />
        </div>
      </div>

      <GoldLine />

      {/* ─ MAP ───────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", background: "var(--ivory)" }}>
        <GoldOrbs light />
        <div style={{ position: "relative", zIndex: 1 }}>
          <MapSection />
        </div>
      </div>

      <GoldLine />

      {/* ─ INTELLIGENCE OS ───────────────────────────────────────────── */}
      <div style={{ position: "relative" }}>
        <GoldOrbs />
        <div style={{ position: "relative", zIndex: 1 }}>
          <IntelligenceOS />
        </div>
      </div>

      <GoldLine />

      {/* ─ SECURITY SHIELD ───────────────────────────────────────────── */}
      <div style={{ position: "relative" }}>
        <GoldOrbs />
        <div style={{ position: "relative", zIndex: 1 }}>
          <SecurityShield />
        </div>
      </div>

      <GoldLine />

      {/* ─ WHY SIERRA ────────────────────────────────────────────────── */}
      <div style={{ position: "relative", background: "#ffffff" }}>
        <GoldOrbs light />
        <div style={{ position: "relative", zIndex: 1 }}>
          <WhySierra />
        </div>
      </div>

      <GoldLine />

      {/* ─ STATS ─────────────────────────────────────────────────────── */}
      <div style={{ position: "relative" }}>
        <GoldOrbs />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Stats />
        </div>
      </div>

      <GoldLine />

      {/* ─ TESTIMONIALS ──────────────────────────────────────────────── */}
      <div style={{ position: "relative", background: "var(--ivory)" }}>
        <GoldOrbs light />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Testimonials />
        </div>
      </div>

      <GoldLine />

      {/* ─ CONTACT ───────────────────────────────────────────────────── */}
      <section id="contact" style={{ position: "relative", background: "var(--navy2)", padding: "110px 0", overflow: "hidden" }}>
        {/* Animated background particles */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {[...Array(20)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1,
              height: i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1,
              borderRadius: "50%",
              background: "var(--gold)",
              opacity: 0.15 + (i % 5) * 0.07,
              left: `${5 + (i * 4.8) % 90}%`,
              top: `${10 + (i * 7.3) % 80}%`,
              animation: `particleDrift ${8 + (i % 7) * 2}s ease-in-out ${(i % 5) * 0.8}s infinite`,
            }} />
          ))}
          {/* Big orbs */}
          <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(211,167,71,.06) 0%, transparent 65%)", top: "-20%", right: "-10%", animation: "orbFloat1 16s ease-in-out infinite" }} />
          <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,90,180,.08) 0%, transparent 65%)", bottom: "-10%", left: "-5%", animation: "orbFloat2 20s ease-in-out infinite" }} />
          {/* Animated gold grid lines */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(211,167,71,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(211,167,71,.04) 1px, transparent 1px)", backgroundSize: "60px 60px", animation: "gridDrift 30s linear infinite" }} />
        </div>

        <div style={{ position: "relative", zIndex: 2, maxWidth: 1320, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <div className="sec-eyebrow light rv" style={{ justifyContent: "center" }}>Get In Touch</div>
          <h2 className="sec-title light rv rv-d1" style={{ marginBottom: 12 }}>Find Your Property</h2>
          <p className="sec-sub light rv rv-d2" style={{ maxWidth: 520, margin: "0 auto 44px" }}>
            Tell us what you are looking for and we will match you with the best options in 24 hours.
          </p>

          {/* CTA button */}
          <div className="rv rv-d3" style={{ marginBottom: 64 }}>
            <button
              onClick={() => setContactOpen(true)}
              style={{ padding: "18px 52px", borderRadius: 14, background: "linear-gradient(135deg,var(--gold),var(--gold-lt))", color: "var(--navy)", fontSize: 13, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 36px rgba(211,167,71,.4)", transition: "all .3s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = "translateY(-4px) scale(1.03)"; b.style.boxShadow = "0 20px 50px rgba(211,167,71,.55)"; }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = ""; b.style.boxShadow = "0 8px 36px rgba(211,167,71,.4)"; }}
            >
              <span style={{ position: "relative", zIndex: 1 }}>Submit Request — 25% OFF</span>
            </button>
          </div>

          {/* Contact cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, textAlign: "left" }}>
            {[
              {
                icon: "📞",
                title: "Call Us",
                desc: "+20 109 204 8333",
                sub: "Sun–Thu · 9am–9pm",
                href: "tel:+201092048333",
                action: "Call Now",
              },
              {
                icon: "💬",
                title: "WhatsApp",
                desc: "+20 109 204 8333",
                sub: "Available 24/7",
                href: "https://wa.me/201092048333?text=Hello%2C%20I%27m%20interested%20in%20a%20property%20via%20Sierra%20Estates",
                action: "Chat on WhatsApp",
              },
              {
                icon: "✉️",
                title: "Email Us",
                desc: "info@Sierra-Estates.com",
                sub: "Reply within 2 hours",
                href: "mailto:info@Sierra-Estates.com",
                action: "Send Email",
              },
            ].map((c, i) => (
              <a
                key={i}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className={`rv rv-d${i + 1}`}
                style={{ background: "rgba(255,255,255,.05)", borderRadius: 20, padding: "28px 26px 22px", border: "1px solid rgba(211,167,71,.14)", cursor: "pointer", textDecoration: "none", display: "block", transition: "all .3s", backdropFilter: "blur(8px)" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "rgba(255,255,255,.09)"; el.style.border = "1px solid rgba(211,167,71,.38)"; el.style.transform = "translateY(-6px)"; el.style.boxShadow = "0 24px 48px rgba(0,0,0,.3)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "rgba(255,255,255,.05)"; el.style.border = "1px solid rgba(211,167,71,.14)"; el.style.transform = ""; el.style.boxShadow = ""; }}
              >
                <div style={{ fontSize: 32, marginBottom: 14, animation: `iconBob ${2.5 + i * .7}s ease-in-out infinite` }}>{c.icon}</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#fff", marginBottom: 8 }}>{c.title}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--gold-lt)", marginBottom: 4, fontFamily: "var(--font-mono)", letterSpacing: ".04em" }}>{c.desc}</div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.32)", marginBottom: 16 }}>{c.sub}</div>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", display: "flex", alignItems: "center", gap: 5 }}>
                  {c.action} <span style={{ animation: "arrowPulse 1.8s ease-in-out infinite" }}>→</span>
                </div>
              </a>
            ))}
          </div>

          {/* Address strip */}
          <div className="rv rv-d4" style={{ marginTop: 32, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 24px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(211,167,71,.1)", maxWidth: 480, margin: "32px auto 0" }}>
            <span style={{ fontSize: 16 }}>📍</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.45)" }}>90 South Street, 5th Settlement, New Cairo, Egypt</span>
          </div>
        </div>

        <style>{`
          @media(max-width:768px){ section#contact div[style*="repeat(3,1fr)"]{ grid-template-columns:1fr!important; } }
          @keyframes particleDrift { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-18px) scale(1.3);} }
          @keyframes arrowPulse { 0%,100%{transform:translateX(0);} 50%{transform:translateX(5px);} }
          @keyframes iconBob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-5px);} }
          @keyframes gridDrift { from{background-position:0 0;} to{background-position:60px 60px;} }
          @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(30px,-20px) scale(1.04);} 66%{transform:translate(-15px,25px) scale(.97);} }
          @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1);} 40%{transform:translate(-25px,15px) scale(1.06);} 75%{transform:translate(20px,-30px) scale(.95);} }
          @keyframes orbFloat3 { 0%,100%{transform:translate(0,0);} 50%{transform:translate(15px,-15px);} }
        `}</style>
      </section>

      <Footer />
      <AIChat />
      <Contact open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
