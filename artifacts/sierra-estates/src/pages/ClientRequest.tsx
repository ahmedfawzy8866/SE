import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Building2, Home, MapPin, Wallet, Bed, Phone, User, CheckCircle2, ChevronRight, MessageSquare } from "lucide-react";
import { Link } from "wouter";

const PROPERTY_TYPES = ["فيلا", "شقة", "تاون هاوس", "توين هاوس", "شاليه", "مكتب / تجاري"];
const AREAS = ["التجمع الخامس", "الشيخ زايد", "الساحل الشمالي", "العاصمة الإدارية", "مستقبل سيتي", "أكتوبر", "أخرى"];
const BUDGETS = ["أقل من 5 مليون", "5 مليون - 10 مليون", "10 مليون - 20 مليون", "20 مليون - 35 مليون", "أكثر من 35 مليون"];

export default function ClientRequest() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    intent: "شراء",
    type: "",
    area: "",
    budget: "",
    rooms: "",
    name: "",
    phone: "",
    notes: ""
  });

  const updateForm = (key: string, val: string) => setFormData(prev => ({ ...prev, [key]: val }));

  const nextStep = () => {
    if (step === 1 && (!formData.type || !formData.area)) {
      setError("برجاء اختيار نوع العقار والمنطقة");
      return;
    }
    if (step === 2 && (!formData.budget || !formData.rooms)) {
      setError("برجاء تحديد الميزانية وعدد الغرف");
      return;
    }
    setError("");
    setStep(s => s + 1);
  };

  const submitRequest = async () => {
    if (!formData.name || !formData.phone) {
      setError("برجاء إدخال الاسم ورقم الهاتف للتواصل");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "client_requests"), {
        ...formData,
        status: "new",
        source: "Landing Page Form",
        createdAt: serverTimestamp()
      });
      setSuccess(true);
    } catch (err: any) {
      setError("حدث خطأ أثناء إرسال الطلب، برجاء المحاولة لاحقاً.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="req-wrap success-state">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, type: "spring" }} className="req-box text-center">
          <div className="icon-wrap mx-auto mb-6"><CheckCircle2 size={64} className="text-emerald-400" /></div>
          <h1 className="text-3xl font-bold text-white mb-4 font-serif">تم إرسال طلبك بنجاح!</h1>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            شكراً لثقتك في سييرا استيتس. سيقوم أحد مستشارينا العقاريين بدراسة طلبك بعناية والتواصل معك في أقرب وقت عبر الواتساب لعرض أفضل الخيارات المتاحة.
          </p>
          <Link href="/">
            <button className="btn-gold px-8 py-3 rounded-full text-black font-bold">العودة للرئيسية</button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="req-wrap min-h-screen relative flex items-center justify-center p-4 bg-black overflow-hidden dir-rtl">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#C9A96E]/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#002D62]/20 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/">
            <img src="/assets/logo-gold.svg" alt="Sierra Estates" className="h-10 mx-auto mb-6 cursor-pointer hover:opacity-80 transition" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif text-white mb-3">ابحث عن عقار أحلامك</h1>
          <p className="text-[#C9A96E] text-sm tracking-wide">SIERRA ESTATES PROPERTY FINDER</p>
        </div>

        {/* Form Container */}
        <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl">
          
          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#C9A96E]' : 'bg-white/10'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="space-y-8">
                
                {/* Intent */}
                <div>
                  <label className="req-label">ما هو هدفك؟</label>
                  <div className="flex gap-3">
                    {["شراء", "إيجار"].map(int => (
                      <button key={int} onClick={() => updateForm("intent", int)} className={`flex-1 py-4 rounded-xl border transition-all ${formData.intent === int ? 'bg-[#C9A96E]/20 border-[#C9A96E] text-[#C9A96E]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
                        {int}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="req-label"><Building2 size={16} /> نوع العقار</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {PROPERTY_TYPES.map(pt => (
                      <button key={pt} onClick={() => updateForm("type", pt)} className={`py-3 px-2 text-sm rounded-xl border transition-all ${formData.type === pt ? 'bg-[#C9A96E]/20 border-[#C9A96E] text-[#C9A96E]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
                        {pt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Area */}
                <div>
                  <label className="req-label"><MapPin size={16} /> المنطقة المفضلة</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {AREAS.map(ar => (
                      <button key={ar} onClick={() => updateForm("area", ar)} className={`py-3 px-2 text-sm rounded-xl border transition-all ${formData.area === ar ? 'bg-[#C9A96E]/20 border-[#C9A96E] text-[#C9A96E]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
                        {ar}
                      </button>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="space-y-8">
                
                {/* Budget */}
                <div>
                  <label className="req-label"><Wallet size={16} /> الميزانية المقترحة</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {BUDGETS.map(bg => (
                      <button key={bg} onClick={() => updateForm("budget", bg)} className={`py-4 px-4 text-sm rounded-xl border transition-all text-right ${formData.budget === bg ? 'bg-[#C9A96E]/20 border-[#C9A96E] text-[#C9A96E]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rooms */}
                <div>
                  <label className="req-label"><Bed size={16} /> عدد الغرف</label>
                  <div className="flex gap-3">
                    {["1", "2", "3", "4", "5+"].map(rm => (
                      <button key={rm} onClick={() => updateForm("rooms", rm)} className={`flex-1 py-4 rounded-xl border transition-all ${formData.rooms === rm ? 'bg-[#C9A96E]/20 border-[#C9A96E] text-[#C9A96E]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
                        {rm}
                      </button>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="space-y-6">
                
                <div>
                  <label className="req-label"><User size={16} /> الاسم</label>
                  <input type="text" value={formData.name} onChange={e => updateForm("name", e.target.value)} placeholder="الاسم بالكامل" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#C9A96E] transition-all" />
                </div>

                <div>
                  <label className="req-label"><Phone size={16} /> رقم الهاتف (واتساب)</label>
                  <input type="tel" value={formData.phone} onChange={e => updateForm("phone", e.target.value)} placeholder="010xxxxxxxx" dir="ltr" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#C9A96E] transition-all text-right" />
                </div>

                <div>
                  <label className="req-label"><MessageSquare size={16} /> ملاحظات إضافية (اختياري)</label>
                  <textarea value={formData.notes} onChange={e => updateForm("notes", e.target.value)} placeholder="مثال: قريب من الجامعة الأمريكية، استلام فوري..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#C9A96E] transition-all resize-none" />
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && <div className="text-red-400 text-sm mt-4">{error}</div>}

          {/* Navigation Buttons */}
          <div className="mt-8 flex gap-4 pt-6 border-t border-white/10">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all">
                رجوع
              </button>
            )}
            
            {step < 3 ? (
              <button onClick={nextStep} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#C9A96E] to-[#A07840] text-black font-bold py-3 rounded-xl hover:opacity-90 transition-all">
                التالي <ChevronRight className="rotate-180" size={18} />
              </button>
            ) : (
              <button onClick={submitRequest} disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#C9A96E] to-[#A07840] text-black font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
                {loading ? "جاري الإرسال..." : "إرسال الطلب"}
              </button>
            )}
          </div>

        </div>
      </div>

      <style>{`
        .dir-rtl { direction: rtl; }
        .req-label { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.9); font-size: 0.9rem; margin-bottom: 12px; font-weight: 500; }
        .btn-gold { background: linear-gradient(135deg, #C9A96E, #A07840); }
      `}</style>
    </div>
  );
}
