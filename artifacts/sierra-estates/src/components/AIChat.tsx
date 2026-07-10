import { useState, useRef, useEffect } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { X } from "lucide-react";

const AI_RESP: Record<string, string> = {
  hyde:    "Hyde Park: villas from EGP 22M. AI Score 9.8/10 — highest YoY appreciation (+22%). 3 units available today.",
  mivida:  "Mivida by SODIC: 2-bed units from EGP 5.2M. Avg rental $1,700/mo. AI Score 9.1/10 — strong expat demand.",
  roi:     "Top ROI: Mountain View iCity (+24%), Uptown Cairo (+31%), Hyde Park (+22%). Strong Q2 2026 signals.",
  rent:    "Best rental: Al Rehab from $1,380/mo, Madinaty $1,480/mo. Premium: Hyde Park from $6,100/mo.",
  default: "I'm Sierra AI — ask about any compound, ROI or budget and I'll find your perfect match in New Cairo.",
};

const CHIPS = ["Best ROI", "Hyde Park", "Mivida rentals", "AI analysis"];

interface Msg { r: "ai" | "user"; t: string; }

export default function AIChat() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ r: "ai", t: AI_RESP.default }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (bRef.current) bRef.current.scrollTop = bRef.current.scrollHeight; }, [msgs, typing]);

  const send = (text?: string) => {
    const txt = (text ?? input).trim(); if (!txt) return;
    setInput("");
    setMsgs(m => [...m, { r: "user", t: txt }]);
    setTyping(true);
    setTimeout(() => {
      const q = txt.toLowerCase();
      const rep = q.includes("hyde") ? AI_RESP.hyde
        : q.includes("mivida") ? AI_RESP.mivida
        : q.includes("roi") || q.includes("invest") ? AI_RESP.roi
        : q.includes("rent") ? AI_RESP.rent
        : AI_RESP.default;
      setMsgs(m => [...m, { r: "ai", t: rep }]);
      setTyping(false);
    }, 1300);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fab-btn"
        style={{ position: "fixed", bottom: 28, right: 28, zIndex: 800 }}
        aria-label="AI Chat"
      >
        AI
        {!open && <span style={{ position: "absolute", top: -2, right: -2, width: 13, height: 13, borderRadius: "50%", background: "#4ade80", border: "2px solid white" }} />}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 100, right: 28, zIndex: 800,
          width: 360, background: "white", borderRadius: 20,
          boxShadow: "0 24px 80px rgba(0,45,98,.22)", border: "1px solid rgba(0,45,98,.1)",
          animation: "slideUp .35s cubic-bezier(.16,1,.3,1) both", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "14px 16px", background: "var(--navy)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,var(--gold),var(--gold-lt))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--navy)", fontWeight: 700 }}>S</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1 }}>Sierra AI</div>
              <div style={{ fontSize: 9, color: "#4ade80", letterSpacing: ".1em", marginTop: 2 }}>{t("chat.online")}</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ marginInlineStart: "auto", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.4)" }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={bRef} style={{ height: 220, overflowY: "auto", padding: "12px 12px 6px", display: "flex", flexDirection: "column", gap: 8 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{
                maxWidth: "85%", padding: "8px 12px",
                borderRadius: m.r === "ai" ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                fontSize: 11.5, lineHeight: 1.55,
                background: m.r === "ai" ? "rgba(0,45,98,.05)" : "linear-gradient(135deg,var(--gold),var(--gold-lt))",
                color: m.r === "ai" ? "var(--text)" : "var(--navy)",
                border: m.r === "ai" ? "1px solid rgba(0,45,98,.1)" : "none",
                alignSelf: m.r === "ai" ? "flex-start" : "flex-end",
              }}>{m.t}</div>
            ))}
            {typing && (
              <div style={{ display: "flex", gap: 4, padding: "8px 12px", borderRadius: "4px 12px 12px 12px", background: "rgba(0,45,98,.05)", border: "1px solid rgba(0,45,98,.1)", alignSelf: "flex-start", width: 52 }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", display: "block", animation: `dotPulse 1.4s ease-in-out ${i*.16}s infinite both` }} />)}
              </div>
            )}
          </div>

          {/* Chips */}
          <div style={{ display: "flex", gap: 6, padding: "0 12px 10px", flexWrap: "wrap" }}>
            {CHIPS.map((s, i) => (
              <button key={i} onClick={() => send(s)} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 9.5, fontWeight: 600, background: "rgba(0,45,98,.05)", border: "1px solid rgba(0,45,98,.12)", color: "var(--navy)", cursor: "pointer", fontFamily: "inherit", transition: "all .18s" }}>
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "6px 12px 12px", display: "flex", gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
              placeholder={t("chat.placeholder")}
              style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: "1px solid rgba(0,45,98,.14)", background: "rgba(0,45,98,.03)", fontSize: 12, color: "var(--text)", outline: "none", fontFamily: "inherit" }} />
            <button onClick={() => send()} style={{ padding: "9px 14px", borderRadius: 9, background: "var(--navy)", color: "var(--gold)", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>→</button>
          </div>
        </div>
      )}
    </>
  );
}
