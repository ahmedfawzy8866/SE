import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";

interface Props {
  visible: boolean;
  matchCount: number;
  topOffset: number;
  onClose: () => void;
}

export default function SmartRequest({ visible, matchCount, topOffset, onClose }: Props) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => { if (wa.trim()) setDone(true); };

  if (!visible) return null;
  return (
    <div className="smart-panel" style={{ top: topOffset + 58 }}>
      <div className="sp-inner">
        {done ? (
          <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "6px 0" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(52,211,153,.12)", border: "1px solid #34D399", display: "flex", alignItems: "center", justifyContent: "center", color: "#34D399", fontSize: 16 }}>✓</div>
            <div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 19, color: "var(--navy)", fontWeight: 400 }}>Request Sent</div>
              <div style={{ fontSize: 11, color: "var(--text-m)", marginTop: 2 }}>{matchCount} matched listings — we'll reach out on WhatsApp shortly</div>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="sp-lbl">{t("smart.name")} <span style={{ opacity: .42, fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: 8 }}>optional</span></div>
              <input className="sp-inp" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
            <div>
              <div className="sp-lbl">{t("smart.wa")}</div>
              <input className="sp-inp" placeholder="+20 10x xxx xxxx" value={wa} onChange={e => setWa(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} autoFocus />
            </div>
            <button className="sp-btn" onClick={submit} style={{ marginTop: 18 }}>
              Search · {matchCount} {matchCount === 1 ? "Match" : "Matches"} →
            </button>
          </>
        )}
      </div>
      <button onClick={onClose} style={{ position: "absolute", top: 12, right: 18, background: "none", border: "none", cursor: "pointer", color: "var(--text-m)", fontSize: 22, lineHeight: 1, fontFamily: "inherit" }}>×</button>
    </div>
  );
}
