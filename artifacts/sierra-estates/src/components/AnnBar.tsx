import { useLang } from "@/contexts/LanguageContext";

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onClaim: () => void;
}

export default function AnnBar({ visible, onDismiss, onClaim }: Props) {
  const { t } = useLang();
  if (!visible) return null;
  return (
    <div className="ann-bar" style={{ top: 0 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--gold)", display: "block", animation: "blink 1.8s ease infinite", flexShrink: 0 }} />
      <span style={{ background: "linear-gradient(135deg,var(--gold),var(--gold-lt))", color: "var(--navy)", fontSize: 9, fontWeight: 800, letterSpacing: ".12em", padding: "2px 8px", borderRadius: 4 }}>
        25% OFF
      </span>
      <span style={{ color: "rgba(255,255,255,.8)", fontSize: 11, fontWeight: 400 }}>
        {t("ann.text")}
      </span>
      <span
        style={{ borderLeft: "1px solid rgba(211,167,71,.3)", paddingLeft: 10, color: "rgba(211,167,71,.9)", fontSize: 10, fontWeight: 700, cursor: "pointer" }}
        onClick={onClaim}
      >
        {t("ann.spots")}
      </span>
      <button onClick={onDismiss} style={{ position: "absolute", right: 16, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.35)", fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
  );
}
