import { useLang } from "@/contexts/LanguageContext";

const WHY_CARDS = [
  { n: "01", tk: "why.c1", icon: "🏆" },
  { n: "02", tk: "why.c2", icon: "🤖" },
  { n: "03", tk: "why.c3", icon: "🌐" },
];

export default function WhySierra() {
  const { t } = useLang();
  return (
    <section style={{ background: "var(--ivory-dk)", padding: "90px 0" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 56, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "end" }}>
          <div>
            <div className="sec-eyebrow">{t("why.eyebrow")}</div>
            <h2 className="sec-title" style={{ marginBottom: 0 }}>{t("why.title")}</h2>
          </div>
          <p className="sec-sub" style={{ marginBottom: 0, paddingBottom: 6 }}>{t("why.sub")}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
          {WHY_CARDS.map((c, i) => (
            <div key={i} className="why-card" data-n={c.n}>
              <div style={{ fontSize: 32, marginBottom: 20 }}>{c.icon}</div>
              <h3>{t(`${c.tk}.title`)}</h3>
              <p>{t(`${c.tk}.desc`)}</p>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div style={{ marginTop: 52, display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            "🏆 #1 AI Real Estate Platform",
            "✅ 3,200+ Verified Transactions",
            "🌍 Bilingual Support 24/7",
            "🔒 Secure & Confidential",
            "⚡ Instant AI Matching",
          ].map((badge, i) => (
            <div key={i} style={{ padding: "8px 18px", borderRadius: 100, border: "1px solid rgba(211,167,71,.25)", background: "rgba(211,167,71,.06)", fontSize: 11.5, color: "var(--navy)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              {badge}
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:900px){div[style*="gridTemplateColumns:'1fr 1fr'"]{grid-template-columns:1fr!important;}.why-card+.why-card{margin-top:0}div[style*="repeat(3,1fr)"]{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}
