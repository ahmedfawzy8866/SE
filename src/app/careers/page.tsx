'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Briefcase, Globe, Send, CheckCircle2 } from 'lucide-react';

const T = { navy:'#0A1628', bone:'#F4F0E8', ivory:'#FDFCF9', charcoal:'#1A2535', slate:'#4B5A6A', mist:'#8C9BAB', line:'rgba(26,37,53,0.1)', lineStrong:'rgba(26,37,53,0.15)', gold:'#C9A24D', goldHi:'#E9C176', goldDeep:'#A87C2A', green:'#34d399', ease:'cubic-bezier(0.22,1,0.36,1)' } as const;
const F = { display:'"Playfair Display","Instrument Serif",serif', body:'"Plus Jakarta Sans","Cairo",sans-serif', mono:'"JetBrains Mono","Geist Mono",monospace' } as const;

const LASER_CSS = `
  @keyframes se-laser {
    0%   { transform:translateY(0);     opacity:0; }
    8%   { opacity:.95; }
    92%  { opacity:.95; }
    100% { transform:translateY(640px); opacity:0; }
  }
  .hero-laser {
    position:absolute; left:0; right:0; top:0; height:2px; z-index:2;
    pointer-events:none;
    background:linear-gradient(90deg,transparent,#e9c176 18%,#fff 50%,#c8961a 82%,transparent);
    box-shadow:0 0 14px 2px rgba(233,193,118,.65);
    opacity:.9;
  }
  @media (prefers-reduced-motion: no-preference) {
    .hero-laser { animation: se-laser 5s cubic-bezier(.6,0,.4,1) infinite; }
  }
  @media (prefers-reduced-motion: reduce) { .hero-laser { display:none; } }
`;

const JOBS = [
  { id:1, title:'Senior Property Advisor', dept:'Sales', loc:'New Cairo, Egypt', type:'Full-time', desc:'Own a portfolio of New Cairo compounds. Source direct-owner listings, manage investor relationships, and close high-value deals using Sierra\'s AI tools. Commission-based with strong base.', tags:['Real Estate','CRM','Bilingual EN+AR'] },
  { id:2, title:'AI & Data Engineer', dept:'Technology', loc:'Remote / Cairo', type:'Full-time', desc:'Build and maintain the AVM pricing engine, smart match algorithms, and Firestore data pipelines. Work directly with Next.js 16 + Firebase stack in a fast-moving PropTech environment.', tags:['Python','Firebase','ML','Next.js'] },
  { id:3, title:'Content & SEO Specialist', dept:'Marketing', loc:'Remote', type:'Part-time', desc:'Create Arabic and English editorial content for Sierra\'s blog and portal. Optimize listing copy and compound guides for search. Data-driven, brand-led writing style required.', tags:['SEO','Arabic','Content Strategy'] },
  { id:4, title:'Operations Coordinator', dept:'Operations', loc:'New Cairo, Egypt', type:'Full-time', desc:'Coordinate between advisors, owners, and clients. Manage listing intake, scheduling, and deal documentation. Meticulous attention to detail — this role runs the machine behind the scenes.', tags:['Ops','Excel','CRM','Arabic'] },
];

interface FormState { name: string; email: string; phone: string; role: string; note: string; }

export default function CareersPage() {
  const [form, setForm] = useState<FormState>({ name:'', email:'', phone:'', role:JOBS[0].title, note:'' });
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { const id = requestAnimationFrame(() => setVisible(true)); return () => cancelAnimationFrame(id); }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main style={{ minHeight:'100dvh', background:T.bone, fontFamily:F.body, color:T.charcoal }}>
      <style>{`
        ${LASER_CSS}
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        .jcard:hover { border-color:rgba(201,162,77,.4) !important; box-shadow:0 10px 32px rgba(10,22,40,.12) !important; transform:translateY(-2px); }
        .jcard { transition:border-color .2s,box-shadow .2s,transform .2s ${T.ease}; }
        .field-i:focus { border-color:${T.gold} !important; outline:none; }
        .cta-gold:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(167,124,42,.35) !important; }
        .cta-gold { transition:transform .2s ${T.ease},box-shadow .2s; }
        .apply-link:hover { color:${T.gold} !important; border-color:${T.gold} !important; }
        .apply-link { transition:color .2s,border-color .2s; }
      `}</style>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'22px 24px 0' }}>
        <Link href="/clients" style={{ display:'inline-flex', alignItems:'center', gap:8, color:T.gold, fontFamily:F.mono, fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', textDecoration:'none' }}>
          <ArrowLeft size={14} /> Back to Portal
        </Link>
      </div>

      {/* Hero */}
      <section style={{ background:`linear-gradient(135deg,#07121e 0%,#0D1F30 60%,#07121e 100%)`, padding:'clamp(48px,7vw,72px) 24px clamp(40px,6vw,56px)', position:'relative', overflow:'hidden' }}>
        <div className="hero-laser" />
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(700px 360px at 75% 10%,rgba(201,162,77,.16),transparent 60%)`, pointerEvents:'none' }} />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:2 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, fontFamily:F.mono, fontSize:11, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:T.green, marginBottom:18 }}>
            <span style={{ width:28, height:1.5, background:T.green, display:'inline-block' }} />
            WE'RE HIRING · 4 OPEN ROLES
          </div>
          <h1 style={{ color:'#fff', fontFamily:F.display, fontSize:'clamp(28px,5vw,46px)', fontWeight:700, letterSpacing:'-.02em', lineHeight:1.05, margin:'0 0 16px', maxWidth:700 }}>
            Build the future of{' '}<em style={{ fontStyle:'italic', color:T.goldHi }}>real estate in Egypt</em>
          </h1>
          <p style={{ color:'rgba(244,240,232,.78)', maxWidth:560, fontSize:'clamp(14px,1.7vw,15px)', lineHeight:1.6, margin:0 }}>
            Join Sierra Estates — where AI meets luxury property in New Cairo. We're looking for sharp, driven people who want to shape PropTech in Egypt.
          </p>
        </div>
      </section>

      {/* Jobs section */}
      <section style={{ padding:'clamp(36px,5vw,56px) 24px 40px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <h2 style={{ fontFamily:F.display, fontSize:'clamp(20px,3vw,28px)', fontWeight:700, color:T.charcoal, marginBottom:22, letterSpacing:'-.015em' }}>Open Positions</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {JOBS.map((j, i) => (
              <div key={j.id} className="jcard" style={{ background:T.ivory, border:`1px solid ${T.line}`, borderRadius:16, padding:'24px', boxShadow:`0 2px 10px rgba(10,22,40,.05)`, opacity:visible?1:0, animation:visible?`fadeUp .5s ${T.ease} ${i*70}ms both`:'none' }}>
                <div style={{ display:'flex', gap:16, justifyContent:'space-between', flexWrap:'wrap', marginBottom:12 }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <h3 style={{ fontFamily:F.display, fontSize:20, fontWeight:700, color:T.charcoal, margin:0, letterSpacing:'-.005em' }}>{j.title}</h3>
                    </div>
                    <div style={{ display:'flex', gap:14, flexWrap:'wrap', fontSize:13, color:T.mist }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}><Briefcase size={13} /> {j.dept}</span>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}><MapPin size={13} /> {j.loc}</span>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}><Globe size={13} /> {j.type}</span>
                    </div>
                  </div>
                  <a href="#apply" className="apply-link" style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 18px', border:`1.5px solid ${T.lineStrong}`, borderRadius:9, fontFamily:F.body, fontWeight:700, fontSize:13, color:T.slate, textDecoration:'none', alignSelf:'flex-start' }}>
                    Apply now
                  </a>
                </div>
                <p style={{ fontSize:14, color:T.slate, lineHeight:1.7, marginBottom:14 }}>{j.desc}</p>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {j.tags.map(t => (
                    <span key={t} style={{ fontFamily:F.mono, fontSize:10.5, fontWeight:700, padding:'5px 11px', borderRadius:7, background:`rgba(201,162,77,.1)`, color:T.gold, letterSpacing:'.06em', textTransform:'uppercase' }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply form */}
      <section id="apply" style={{ background:T.ivory, padding:'clamp(40px,5vw,64px) 24px clamp(60px,8vw,100px)', borderTop:`1px solid ${T.line}` }}>
        <div style={{ maxWidth:700, margin:'0 auto' }}>
          <h2 style={{ fontFamily:F.display, fontSize:'clamp(22px,3.5vw,32px)', fontWeight:700, color:T.charcoal, marginBottom:8, letterSpacing:'-.015em', textAlign:'center' }}>Apply Now</h2>
          <p style={{ textAlign:'center', color:T.slate, fontSize:14.5, marginBottom:36 }}>Fill in your details and we'll be in touch within 48 hours.</p>

          {submitted ? (
            <div style={{ textAlign:'center', padding:'40px 20px', animation:`fadeUp .6s ${T.ease} both` }}>
              <CheckCircle2 size={48} style={{ color:T.gold, margin:'0 auto 16px' }} />
              <h3 style={{ fontFamily:F.display, fontSize:26, fontWeight:700, color:T.charcoal, marginBottom:10 }}>Application Received</h3>
              <p style={{ color:T.slate, fontSize:15, lineHeight:1.6 }}>Thanks, {form.name.split(' ')[0]}! We'll review your application for <b style={{ color:T.gold }}>{form.role}</b> and follow up within 48 hours.</p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ background:T.ivory, border:`1px solid ${T.line}`, borderRadius:18, padding:'32px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>
                <FField label="Full Name">
                  <input required className="field-i" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Nour Hassan" style={INPUT} />
                </FField>
                <FField label="Email">
                  <input required type="email" className="field-i" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="nour@example.com" style={INPUT} />
                </FField>
                <FField label="Phone">
                  <input className="field-i" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} placeholder="+20 1XX XXX XXXX" style={INPUT} />
                </FField>
                <FField label="Role Applying For">
                  <select className="field-i" value={form.role} onChange={e => setForm({...form,role:e.target.value})} style={INPUT}>
                    {JOBS.map(j => <option key={j.id} value={j.title}>{j.title}</option>)}
                  </select>
                </FField>
              </div>
              <FField label="Cover Note" last>
                <textarea required className="field-i" value={form.note} onChange={e => setForm({...form,note:e.target.value})} rows={5} placeholder="Tell us why you're a fit for Sierra Estates..." style={{ ...INPUT, resize:'vertical' }} />
              </FField>
              <div style={{ marginTop:24, textAlign:'center' }}>
                <button type="submit" className="cta-gold" style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'14px 36px', border:'none', borderRadius:11, background:`linear-gradient(135deg,${T.gold},${T.goldDeep})`, color:T.navy, fontFamily:F.body, fontWeight:800, fontSize:15, cursor:'pointer' }}>
                  <Send size={16} /> Submit Application
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

const INPUT: React.CSSProperties = { width:'100%', padding:'13px 16px', border:`1.5px solid rgba(26,37,53,0.15)`, borderRadius:11, fontFamily:'"Plus Jakarta Sans","Cairo",sans-serif', fontSize:14.5, color:'#1A2535', background:'#F4F0E8', boxSizing:'border-box' };

function FField({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : 0 }}>
      <label style={{ display:'block', fontFamily:'"JetBrains Mono","Geist Mono",monospace', fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', color:'#8C9BAB', marginBottom:9, fontWeight:700 }}>{label}</label>
      {children}
    </div>
  );
}
