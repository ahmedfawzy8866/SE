/* Sierra Estates — Admin "Intelligence OS" sample data. */
window.SE_KPIS = [
  { label:'Active Listings', value:'1,504', delta:'+42', up:true },
  { label:'Hot Leads', value:'87', delta:'+13', up:true },
  { label:'Viewings (wk)', value:'214', delta:'+8%', up:true },
  { label:'Deals Closing', value:'19', delta:'+3', up:true },
  { label:'Avg AI Score', value:'9.1', delta:'+0.2', up:true },
  { label:'Response Time', value:'2.4m', delta:'-11%', up:true },
  { label:'Compounds', value:'19', delta:'0', up:true },
  { label:'GMV (mo)', value:'EGP 214M', delta:'+18%', up:true },
];

window.SE_PIPELINE = [
  { stage:'S1 Ingest', n:1504 },{ stage:'S2 Verify', n:1120 },{ stage:'S3 Price', n:860 },
  { stage:'S4 Match', n:540 },{ stage:'S5 Contact', n:310 },{ stage:'S6 Viewing', n:214 },
  { stage:'S7 Offer', n:96 },{ stage:'S8 Negotiate', n:47 },{ stage:'S9 Close', n:19 },
];

window.SE_AGENTS = [
  { name:'Sierra Bot', role:'Primary AI concierge', stack:'Next.js · Gemini', status:'online', load:82, icon:'bot' },
  { name:'Leila / Lola', role:'Arabic specialist', stack:'Bilingual routes', status:'online', load:64, icon:'message-circle' },
  { name:'Stage-9 Closer', role:'Contracts & payment', stack:'Python · Stripe', status:'online', load:38, icon:'file-signature' },
  { name:'WhatsApp Scraper', role:'Lead harvesting', stack:'Playwright · Node', status:'paused', load:0, icon:'radar' },
  { name:'The Scribe', role:'S1–S2 ingestion', stack:'FastAPI', status:'online', load:71, icon:'scroll-text' },
  { name:'The Curator', role:'S3–S5 pricing / AVM', stack:'FastAPI', status:'online', load:55, icon:'gem' },
];

window.SE_LEADS = [
  { name:'Mostafa Kamel', phone:'+20 100 221 4567', compound:'Hyde Park', budget:'EGP 22M', score:9.6, stage:'Viewing', hot:true },
  { name:'Yasmine Adel', phone:'+20 101 553 8890', compound:'Mivida', budget:'EGP 850K/yr', score:9.1, stage:'Offer', hot:true },
  { name:'Karim Nabil', phone:'+20 122 447 1120', compound:'Madinaty', budget:'EGP 8.5M', score:8.7, stage:'Contact', hot:false },
  { name:'Salma Farid', phone:'+20 128 990 3345', compound:'Villette', budget:'EGP 11.5M', score:9.3, stage:'Negotiate', hot:true },
  { name:'Omar Hesham', phone:'+20 106 334 7781', compound:'Taj City', budget:'EGP 19.5M', score:8.9, stage:'Match', hot:false },
  { name:'Nadia Wael', phone:'+20 111 228 6654', compound:'Eastown', budget:'EGP 9.2M', score:8.4, stage:'Contact', hot:false },
];

window.SE_NAV = [
  ['layout-dashboard','Intelligence OS',true],['bot','Agents & Bots'],['workflow','Workflows'],
  ['terminal','OpenClaw'],['users','CRM Leads'],['building-2','Listings Hub'],
  ['sparkles','Curator'],['scroll-text','Scribe'],['handshake','Stage-9 Closer'],
  ['bar-chart-3','Reports'],['settings','Settings'],
];
