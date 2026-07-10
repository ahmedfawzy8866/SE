import { useLang } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t, isRTL } = useLang();
  const scrollTo = (href: string) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

  const cols = [
    { title: t("footer.company"), links: ["About Sierra", "Our Team", "Press", "Careers"] },
    { title: t("footer.services"), links: ["Property Search", "Virtual Tours", "AI Matching", "Investment Advice"] },
    { title: t("footer.compounds"), links: ["Hyde Park", "Mountain View iCity", "Mivida", "Uptown Cairo", "Madinaty"] },
    { title: t("footer.legal"), links: ["Privacy Policy", "Terms of Use", "Cookie Policy"] },
  ];

  return (
    <footer className="ftr" dir={isRTL ? "rtl" : "ltr"}>
      <div className="ftr-grid">
        {/* Brand col */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <img src="/logo.jpg" alt="Sierra Estates" style={{ width: 42, height: 42, objectFit: "cover", borderRadius: 8, border: "1.5px solid rgba(211,167,71,.3)", flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 600, letterSpacing: ".24em", color: "var(--gold)", textTransform: "uppercase", lineHeight: 1.1 }}>Sierra Estates</div>
              <div style={{ fontSize: 7.5, letterSpacing: ".2em", color: "rgba(211,167,71,.45)", marginTop: 3, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>{t("footer.slogan")}</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.38)", lineHeight: 1.8, maxWidth: 260, marginBottom: 22 }}>
            New Cairo's most intelligent real estate platform. AI-driven. Human-curated. Always ahead.
          </p>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {["𝕏", "in", "📷", "▶"].map((ic, i) => (
              <div key={i} style={{
                width: 34, height: 34, borderRadius: "50%",
                border: "1px solid rgba(211,167,71,.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "rgba(255,255,255,.42)", fontSize: 13,
                transition: "all .2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(211,167,71,.5)"; (e.currentTarget as HTMLDivElement).style.color = "var(--gold-lt)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(211,167,71,.18)"; (e.currentTarget as HTMLDivElement).style.color = "rgba(255,255,255,.42)"; }}
              >{ic}</div>
            ))}
          </div>
          {/* Contact quick links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <a href="tel:+201092048333" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "rgba(255,255,255,.42)", textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--gold-lt)"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.42)"}>
              <span>📞</span> +20 109 204 8333
            </a>
            <a href="https://wa.me/201092048333" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "rgba(255,255,255,.42)", textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--gold-lt)"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.42)"}>
              <span>💬</span> WhatsApp 24/7
            </a>
            <a href="mailto:info@Sierra-Estates.com" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "rgba(255,255,255,.42)", textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--gold-lt)"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.42)"}>
              <span>✉️</span> info@Sierra-Estates.com
            </a>
          </div>
        </div>

        {/* Link cols */}
        {cols.map((col, ci) => (
          <div key={ci}>
            <div className="ftr-col-t">{col.title}</div>
            {col.links.map((l, li) => (
              <span key={li} className="ftr-link" onClick={() => scrollTo("#hero")}>{l}</span>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: 1320, margin: "0 auto", paddingTop: 28, borderTop: "1px solid rgba(211,167,71,.07)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,.24)" }}>{t("footer.copy")}</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "block" }} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontFamily: "var(--font-mono)" }}>All systems operational</span>
        </div>
      </div>
    </footer>
  );
}
