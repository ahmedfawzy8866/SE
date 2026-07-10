import { useLang } from "@/contexts/LanguageContext";

const FEATURES = [
  { icon: "🧠", tk: "intel.f1" },
  { icon: "⚡", tk: "intel.f2" },
  { icon: "📊", tk: "intel.f3" },
  { icon: "🏠", tk: "intel.f4" },
];

export default function IntelligenceOS() {
  const { t } = useLang();
  return (
    <section id="intel" style={{ background: "var(--white)", padding: "90px 0" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="sec-eyebrow" style={{ justifyContent: "center" }}>{t("intel.eyebrow")}</div>
          <h2 className="sec-title">{t("intel.title")}</h2>
          <p className="sec-sub" style={{ maxWidth: 560, margin: "0 auto" }}>{t("intel.sub")}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 22 }}>
          {FEATURES.map((f, i) => (
            <a key={i} href="#" className="ai-card" onClick={e => e.preventDefault()}>
              <span style={{ position: "absolute", top: 16, right: 16, fontSize: 12, color: "rgba(10,26,43,.22)", transition: "all .28s" }} className="feat-arrow">↗</span>
              <div className="ai-ico">{f.icon}</div>
              <h3>{t(`${f.tk}.title`)}</h3>
              <p>{t(`${f.tk}.desc`)}</p>
              <div className="ai-arrow">LEARN MORE →</div>
            </a>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ marginTop: 52, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {[
            { icon: "📈", label: "Avg. Appreciation", value: "+22%", sub: "Hyde Park · 2025 YoY" },
            { icon: "🎯", label: "AI Match Accuracy", value: "98%", sub: "Based on client surveys" },
            { icon: "⏱️", label: "Response Time", value: "< 4s", sub: "Instant AI matching" },
          ].map((s, i) => (
            <div key={i} style={{ background: "var(--ivory)", borderRadius: 16, padding: "24px 28px", border: "1px solid rgba(211,167,71,.12)", display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(211,167,71,.08)", border: "1px solid rgba(211,167,71,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, background: "linear-gradient(135deg,var(--gold-dk),var(--gold))", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--navy)", marginTop: 4 }}>{s.label}</div>
                <div style={{ fontSize: 9.5, color: "var(--text-f)", marginTop: 2 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:900px){div[style*="repeat(4,1fr)"]{grid-template-columns:repeat(2,1fr)!important;}}@media(max-width:540px){div[style*="repeat(4,1fr)"]{grid-template-columns:1fr!important;}}@media(max-width:768px){div[style*="repeat(3,1fr)"]{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}
