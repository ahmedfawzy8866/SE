import { useLang } from "@/contexts/LanguageContext";

export default function SecurityShield() {
  const { t, isRTL } = useLang();

  return (
    <section className={`sec ${isRTL ? "rtl" : "ltr"} sec-bg-navy relative overflow-hidden`}>
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        {/* Subtle grid background to match the aesthetic */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(211,167,71,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(211,167,71,.04) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        
        {/* Graphic Side */}
        <div className="w-full md:w-1/2 flex justify-center rv-scale">
          <div className="relative max-w-[400px] w-full aspect-square rounded-2xl overflow-hidden border border-[rgba(211,167,71,0.2)] shadow-[0_0_40px_rgba(220,38,38,0.15)] group">
            <img 
              src="/shield-design.jpg" 
              alt="Security Shield" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,25,40,0.8)] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Content Side */}
        <div className="w-full md:w-1/2 flex flex-col items-start text-left">
          <div className="sec-eyebrow light rv" style={{ justifyContent: "flex-start", ...(isRTL ? { flexDirection: "row-reverse" } : {}) }}>
            {t("shield.eyebrow")}
          </div>
          
          <h2 className="sec-title light rv rv-d1" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.1 }}>
            {t("shield.title")}
          </h2>
          
          <p className="sec-sub light rv rv-d2" style={{ maxWidth: 480, fontSize: "14px", marginTop: "12px", marginBottom: "36px" }}>
            {t("shield.sub")}
          </p>

          <div className="flex flex-col gap-6 w-full rv rv-d3">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[rgba(211,167,71,0.1)] border border-[rgba(211,167,71,0.2)] flex items-center justify-center flex-shrink-0 text-[rgba(211,167,71,0.9)] text-lg">
                🔒
              </div>
              <div>
                <h4 className="font-serif text-[20px] text-white mb-1">{t("shield.f1.title")}</h4>
                <p className="text-[12px] text-gray-400 leading-relaxed">{t("shield.f1.desc")}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[rgba(211,167,71,0.1)] border border-[rgba(211,167,71,0.2)] flex items-center justify-center flex-shrink-0 text-[rgba(211,167,71,0.9)] text-lg">
                🛡️
              </div>
              <div>
                <h4 className="font-serif text-[20px] text-white mb-1">{t("shield.f2.title")}</h4>
                <p className="text-[12px] text-gray-400 leading-relaxed">{t("shield.f2.desc")}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
