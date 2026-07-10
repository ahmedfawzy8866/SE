import { useEffect, useRef, useState } from "react";
import { useLang } from "@/contexts/LanguageContext";

function useCountUp(target: number, duration = 2000, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0; const step = target / (duration / 16);
    const id = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(Math.floor(start));
      if (start >= target) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [active, target, duration]);
  return val;
}

function StatItem({ value, suffix, prefix, label }: { value: number; suffix: string; prefix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const count = useCountUp(value, 2000, active);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="stat-item">
      <div className="stat-val">{prefix}{count.toLocaleString()}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Stats() {
  const { t } = useLang();
  const STATS = [
    { value: 4200, suffix: "M+", prefix: "$", label: t("stats.portfolio") },
    { value: 1500, suffix: "+",  prefix: "",  label: t("stats.listings") },
    { value: 3200, suffix: "+",  prefix: "",  label: t("stats.clients") },
    { value: 19,   suffix: "",   prefix: "",  label: t("stats.compounds") },
  ];
  return (
    <section style={{ background: "var(--ivory)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px 16px" }}>
        <div style={{ textAlign: "center", padding: "72px 0 40px" }}>
          <div className="sec-eyebrow" style={{ justifyContent: "center" }}>{t("stats.title")}</div>
        </div>
      </div>
      <div className="stats-grid">
        {STATS.map((s, i) => <StatItem key={i} {...s} />)}
      </div>
    </section>
  );
}
