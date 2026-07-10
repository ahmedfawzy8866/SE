import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLang } from "@/contexts/LanguageContext";
import { submitLead } from "@/lib/apiClient";
import { ApiError } from "@workspace/api-client-react";

const COMPOUNDS = ["Any","Hyde Park","Mountain View iCity","Uptown Cairo","Mivida","Madinaty","Eastown","Palm Hills NC","Villette","Taj City","Al Rehab","SODIC East","Sarai","Katameya Heights"];
const BUDGETS_EN = ["Any","Under EGP 5M","EGP 5M–10M","EGP 10M–20M","EGP 20M+","Under $2K/mo","$2K–$5K/mo","$5K+/mo"];
const BUDGETS_AR = ["أي","أقل من 5 مليون","5–10 مليون","10–20 مليون","أكثر من 20 مليون","أقل من $2,000/شهر","$2,000–$5,000/شهر","أكثر من $5,000/شهر"];

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Contact({ open, onClose }: Props) {
  const { t, lang, isRTL } = useLang();
  const [form, setForm] = useState({ name: "", email: "", phone: "", compound: "Any", budget: "Any" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: () =>
      submitLead({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        message: `Compound: ${form.compound} | Budget: ${form.budget}`,
        locale: lang,
      }),
  });

  const submit = () => {
    if (!form.phone.trim() || !form.email.trim()) return;
    mutation.mutate();
  };
  const close = () => {
    mutation.reset();
    setForm({ name: "", email: "", phone: "", compound: "Any", budget: "Any" });
    onClose();
  };

  if (!open) return null;

  const errorMessage = mutation.isError
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : t("contact.error")
    : null;

  const waHref = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        lang === "ar" ? "مرحبًا، أريد الاستفسار عن عقار" : "Hi, I'd like to inquire about a property",
      )}`
    : null;

  return (
    <div className="modal-ov" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal-card" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(0,45,98,.08)", position: "sticky", top: 0, background: "white", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 600, color: "var(--navy)" }}>{t("contact.title")}</div>
            <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(0,45,98,.4)", fontSize: 24, lineHeight: 1 }}>×</button>
          </div>
          <div style={{ padding: "9px 12px", borderRadius: 9, background: "linear-gradient(110deg,rgba(0,45,98,.04),rgba(211,167,71,.1))", border: "1px solid rgba(211,167,71,.25)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🏷️</span>
            <span style={{ fontSize: 11, color: "var(--navy)" }}><strong style={{ color: "var(--gold-dk)" }}>25% OFF</strong> service fees — applied automatically. 47 spots remaining.</span>
          </div>
        </div>

        {mutation.isSuccess ? (
          <div style={{ padding: "44px 22px", textAlign: "center" }}>
            <div style={{ width: 66, height: 66, borderRadius: "50%", background: "#16a34a", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "white" }}>✓</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 600, color: "var(--navy)", marginBottom: 8 }}>{t("contact.success.title")}</div>
            <p style={{ fontSize: 13, color: "var(--text-m)", lineHeight: 1.6, marginBottom: 14 }}>{t("contact.success.desc")}</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(211,167,71,.1)", border: "1px solid rgba(211,167,71,.25)", marginBottom: 20 }}>
              <span>🎁</span><span style={{ fontSize: 11, color: "var(--gold-dk)", fontWeight: 700 }}>Your 25% discount has been reserved.</span>
            </div><br />
            {waHref && (
              <a href={waHref} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 8, background: "#16a34a", color: "white", fontSize: 12, fontWeight: 700, textDecoration: "none", marginBottom: 14, marginInlineEnd: 8 }}>
                💬 {t("contact.whatsapp")}
              </a>
            )}
            <button onClick={close} style={{ padding: "9px 24px", borderRadius: 8, border: "1px solid rgba(0,45,98,.14)", background: "none", color: "var(--text-m)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Close</button>
          </div>
        ) : (
          <div style={{ padding: "20px 22px 28px", display: "flex", flexDirection: "column", gap: 13 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {([["contact.name","name","text","Your full name"],[`contact.wa`,"phone","tel","+20 1XX XXX XXXX"]] as const).map(([lk, k, type, ph]) => (
                <div key={k} className="field-w">
                  <div className="f-lbl">{t(lk)}</div>
                  <input type={type} placeholder={ph} value={form[k as keyof typeof form]} onChange={e => set(k, e.target.value)} className="f-in" />
                </div>
              ))}
            </div>
            <div className="field-w">
              <div className="f-lbl">{t("contact.email")}</div>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} className="f-in" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {([["contact.compound","compound",COMPOUNDS],["contact.budget","budget",lang==="ar"?BUDGETS_AR:BUDGETS_EN]] as const).map(([lk, k, opts]) => (
                <div key={k} className="field-w">
                  <div className="f-lbl">{t(lk)}</div>
                  <select value={form[k as keyof typeof form]} onChange={e => set(k, e.target.value)} className="f-in" style={{ cursor: "pointer" }}>
                    {opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            {errorMessage && (
              <div style={{ padding: "9px 12px", borderRadius: 8, background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.25)", color: "#dc2626", fontSize: 11.5 }}>
                {errorMessage}
              </div>
            )}
            <button onClick={submit} disabled={mutation.isPending}
              style={{ padding: 14, borderRadius: 10, background: "linear-gradient(135deg,var(--gold),var(--gold-lt))", color: "var(--navy)", fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", border: "none", cursor: mutation.isPending ? "default" : "pointer", fontFamily: "inherit", boxShadow: "0 6px 22px rgba(211,167,71,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: mutation.isPending ? 0.7 : 1 }}>
              <span>✈</span>{mutation.isPending ? "..." : t("contact.submit")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
