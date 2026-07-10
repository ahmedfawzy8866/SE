import { useLang } from "@/contexts/LanguageContext";

const TESTIMONIALS = [
  { name: "Ahmed Hassan", role: "Villa Owner · Hyde Park", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=75", text: "Sierra Estates found us our dream villa in Hyde Park within 2 weeks. The AI matching was spot on — every property they showed us was exactly what we described. Exceptional service.", stars: 5 },
  { name: "Sarah Al-Mansouri", role: "Investor · Mountain View iCity", img: "https://images.unsplash.com/photo-1494790108755-2616b612b05b?w=80&q=75", text: "The AI score system is incredibly accurate. My investment in Mountain View showed the predicted 24% appreciation within the first year. Their market intelligence is unmatched.", stars: 5 },
  { name: "James & Layla Chen", role: "Expat Family · Mivida", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=75", text: "Moving from Singapore, we were nervous about the process. Sierra's bilingual team made everything seamless. From virtual tour to keys in hand — flawless experience.", stars: 5 },
];

export default function Testimonials() {
  const { t } = useLang();
  return (
    <section style={{ background: "var(--ivory)", padding: "90px 0" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="sec-eyebrow" style={{ justifyContent: "center" }}>{t("testi.eyebrow")}</div>
          <h2 className="sec-title">{t("testi.title")}</h2>
          <p className="sec-sub" style={{ maxWidth: 520, margin: "0 auto" }}>{t("testi.sub")}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {TESTIMONIALS.map((t_, i) => (
            <div key={i} className="testi-card">
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {Array.from({ length: t_.stars }).map((_, j) => (
                  <span key={j} style={{ color: "var(--gold)", fontSize: 16 }}>★</span>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-m)", lineHeight: 1.8, marginBottom: 20, fontStyle: "italic" }}>
                "{t_.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img src={t_.img} alt={t_.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(211,167,71,.3)", flexShrink: 0 }} loading="lazy" />
                <div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600, color: "var(--navy)", lineHeight: 1.1 }}>{t_.name}</div>
                  <div style={{ fontSize: 10, color: "var(--gold-dk)", fontFamily: "var(--font-mono)", letterSpacing: ".12em", marginTop: 3 }}>{t_.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:768px){.testi-card+.testi-card{margin-top:0}}@media(max-width:768px){div[style*="repeat(3,1fr)"]{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}
