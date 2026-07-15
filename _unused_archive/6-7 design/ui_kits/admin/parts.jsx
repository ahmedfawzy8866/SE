/* Sierra Estates — Admin Intelligence OS screens. */
const A = window.SierraEstatesDesignSystem_210542;
const AIc = (n, p={}) => <i data-lucide={n} {...p}></i>;
const aRefresh = () => setTimeout(() => window.lucide && lucide.createIcons(), 30);

/* ── Sidebar ────────────────────────────────────────────────────────── */
function Sidebar({ nav, active, setActive }) {
  return (
    <aside style={{width:248,flexShrink:0,background:'var(--bg-d)',borderRight:'1px solid var(--bd)',
      display:'flex',flexDirection:'column',padding:'20px 14px',height:'100vh',position:'sticky',top:0}}>
      <div style={{display:'flex',alignItems:'center',gap:11,padding:'0 8px 20px',borderBottom:'1px solid var(--bd)'}}>
        <img src="../../assets/logo-red.png" alt="Sierra" style={{width:34,height:34,objectFit:'contain'}}/>
        <div style={{lineHeight:1}}>
          <div style={{fontFamily:'var(--font-display)',fontWeight:600,fontSize:16,letterSpacing:'.1em',color:'var(--tx-s)'}}>SIERRA</div>
          <div style={{fontFamily:'var(--font-mono)',fontSize:7.5,letterSpacing:'.24em',color:'var(--gold)',marginTop:3}}>INTELLIGENCE OS</div>
        </div>
      </div>
      <nav style={{display:'flex',flexDirection:'column',gap:2,marginTop:14,flex:1}}>
        {nav.map(([ic,label])=>{
          const on = label===active;
          return (
            <button key={label} onClick={()=>setActive(label)}
              style={{display:'flex',alignItems:'center',gap:11,padding:'10px 12px',border:'none',cursor:'pointer',textAlign:'start',
                borderRadius:'var(--radius-sm)',fontFamily:'var(--font-ui)',fontSize:13,fontWeight:on?600:500,
                background:on?'var(--surf)':'transparent',color:on?'var(--gold)':'var(--tx-m)',
                borderLeft:'2px solid '+(on?'var(--gold)':'transparent')}}>
              <i data-lucide={ic} style={{width:16,height:16}}></i>{label}
            </button>
          );
        })}
      </nav>
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 8px 0',borderTop:'1px solid var(--bd)'}}>
        <A.Avatar name="Tarek Hassan" ring/>
        <div style={{lineHeight:1.3}}>
          <div style={{fontFamily:'var(--font-ui)',fontSize:12,fontWeight:600,color:'var(--tx-s)'}}>Tarek Hassan</div>
          <div style={{fontFamily:'var(--font-ui)',fontSize:10,color:'var(--tx-f)'}}>Lead broker · Admin</div>
        </div>
      </div>
    </aside>
  );
}

/* ── Topbar ─────────────────────────────────────────────────────────── */
function Topbar({ title }) {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 28px',borderBottom:'1px solid var(--bd)',
      position:'sticky',top:0,zIndex:20,background:'var(--nav-s)',backdropFilter:'blur(18px)'}}>
      <div>
        <div style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.24em',textTransform:'uppercase',color:'var(--gold)'}}>Intelligence OS</div>
        <h1 style={{fontFamily:'var(--font-display)',fontWeight:500,fontSize:28,color:'var(--tx-s)',margin:'4px 0 0'}}>{title}</h1>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:280}}>
          <A.Input placeholder="Search leads, listings, agents…" icon={AIc('search')}/>
        </div>
        <A.IconButton aria-label="Notifications">{AIc('bell')}</A.IconButton>
        <A.Button variant="primary" size="sm" iconLeft={AIc('plus')}>New lead</A.Button>
      </div>
    </div>
  );
}

/* ── Overview ───────────────────────────────────────────────────────── */
function Overview() {
  const max = Math.max(...window.SE_PIPELINE.map(s=>s.n));
  return (
    <div style={{padding:'24px 28px',display:'flex',flexDirection:'column',gap:22}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {window.SE_KPIS.map(k=>(
          <A.Card key={k.label} style={{padding:16}}>
            <div style={{fontFamily:'var(--font-ui)',fontSize:11,textTransform:'uppercase',letterSpacing:'.14em',color:'var(--tx-f)'}}>{k.label}</div>
            <div style={{display:'flex',alignItems:'baseline',gap:8,marginTop:8}}>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:700,fontSize:24,color:'var(--tx-s)'}}>{k.value}</span>
              <span style={{fontFamily:'var(--font-mono)',fontSize:11,fontWeight:600,color:'var(--emerald)'}}>{k.delta}</span>
            </div>
          </A.Card>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:18,alignItems:'start'}}>
        <A.Card style={{padding:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
            <div><A.Eyebrow>Demand funnel</A.Eyebrow>
            <div style={{fontFamily:'var(--font-display)',fontWeight:500,fontSize:20,color:'var(--tx-s)',marginTop:6}}>S1 → S9 pipeline</div></div>
            <A.Badge tone="red" dot>Live</A.Badge>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:9}}>
            {window.SE_PIPELINE.map(s=>(
              <div key={s.stage} style={{display:'flex',alignItems:'center',gap:12}}>
                <span style={{width:90,fontFamily:'var(--font-mono)',fontSize:10,color:'var(--tx-m)'}}>{s.stage}</span>
                <div style={{flex:1,height:16,background:'var(--surf)',borderRadius:8,overflow:'hidden'}}>
                  <div style={{width:(s.n/max*100)+'%',height:'100%',background:'var(--grad-gold)',borderRadius:8}}></div>
                </div>
                <span style={{width:44,textAlign:'right',fontFamily:'var(--font-mono)',fontSize:11,fontWeight:600,color:'var(--gold-lt)'}}>{s.n}</span>
              </div>
            ))}
          </div>
        </A.Card>

        <A.Card style={{padding:20}}>
          <A.Eyebrow>Agent status</A.Eyebrow>
          <div style={{display:'flex',flexDirection:'column',gap:14,marginTop:16}}>
            {window.SE_AGENTS.slice(0,5).map(a=>(
              <div key={a.name} style={{display:'flex',alignItems:'center',gap:11}}>
                <span style={{width:8,height:8,borderRadius:'50%',background:a.status==='online'?'var(--emerald)':'var(--tx-f)',flexShrink:0}}></span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:'var(--font-ui)',fontSize:12,fontWeight:600,color:'var(--tx-s)'}}>{a.name}</div>
                  <div style={{height:4,background:'var(--surf)',borderRadius:2,marginTop:5,overflow:'hidden'}}>
                    <div style={{width:a.load+'%',height:'100%',background:a.status==='online'?'var(--gold)':'var(--tx-f)'}}></div>
                  </div>
                </div>
                <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--tx-m)'}}>{a.load}%</span>
              </div>
            ))}
          </div>
        </A.Card>
      </div>
    </div>
  );
}

/* ── Agents ─────────────────────────────────────────────────────────── */
function Agents() {
  return (
    <div style={{padding:'24px 28px'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        {window.SE_AGENTS.map(a=>(
          <A.Card key={a.name} hover style={{padding:18,display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{width:44,height:44,display:'grid',placeItems:'center',borderRadius:'var(--radius-sm)',background:'var(--bg-d)',color:'var(--gold-lt)'}}>
                <i data-lucide={a.icon} style={{width:22,height:22}}></i></span>
              <A.Badge tone={a.status==='online'?'emerald':'neutral'} dot>{a.status}</A.Badge>
            </div>
            <div>
              <div style={{fontFamily:'var(--font-display)',fontWeight:600,fontSize:18,color:'var(--tx-s)'}}>{a.name}</div>
              <div style={{fontFamily:'var(--font-ui)',fontSize:12,color:'var(--tx-m)',marginTop:3}}>{a.role}</div>
            </div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--tx-f)',textTransform:'uppercase',letterSpacing:'.1em'}}>{a.stack}</div>
            <div style={{display:'flex',gap:8,marginTop:2}}>
              <A.Button variant="ghost" size="sm">Logs</A.Button>
              <A.Button variant={a.status==='online'?'secondary':'primary'} size="sm">{a.status==='online'?'Pause':'Resume'}</A.Button>
            </div>
          </A.Card>
        ))}
      </div>
    </div>
  );
}

/* ── CRM Leads ──────────────────────────────────────────────────────── */
function CRM() {
  const cols = ['Lead','Compound','Budget','AI','Stage',''];
  return (
    <div style={{padding:'24px 28px'}}>
      <A.Card pad={false} style={{overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'1px solid var(--bd)'}}>
              {cols.map((c,i)=>(<th key={i} style={{textAlign:i>=2&&i<5?'center':'start',padding:'14px 18px',
                fontFamily:'var(--font-mono)',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'.14em',color:'var(--tx-f)'}}>{c}</th>))}
            </tr>
          </thead>
          <tbody>
            {window.SE_LEADS.map(l=>(
              <tr key={l.name} style={{borderBottom:'1px solid var(--bd)'}}>
                <td style={{padding:'13px 18px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <A.Avatar name={l.name} size="sm"/>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:7}}>
                        <span style={{fontFamily:'var(--font-ui)',fontSize:13,fontWeight:600,color:'var(--tx-s)'}}>{l.name}</span>
                        {l.hot && <A.Badge tone="red">Hot</A.Badge>}
                      </div>
                      <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--tx-f)'}}>{l.phone}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:'13px 18px',fontFamily:'var(--font-ui)',fontSize:13,color:'var(--tx-m)'}}>{l.compound}</td>
                <td style={{padding:'13px 18px',textAlign:'center',fontFamily:'var(--font-mono)',fontSize:12,fontWeight:600,color:'var(--gold-lt)'}}>{l.budget}</td>
                <td style={{padding:'13px 18px',textAlign:'center'}}><A.Badge tone="emerald">{l.score}</A.Badge></td>
                <td style={{padding:'13px 18px',textAlign:'center',fontFamily:'var(--font-ui)',fontSize:12,color:'var(--tx)'}}>{l.stage}</td>
                <td style={{padding:'13px 18px',textAlign:'end'}}>
                  <A.IconButton aria-label="WhatsApp" size="sm">{AIc('message-circle')}</A.IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </A.Card>
    </div>
  );
}

/* ── OpenClaw terminal ──────────────────────────────────────────────── */
function Terminal() {
  const [lines, setLines] = React.useState([
    { t:'sys', v:'Sierra OpenClaw · type "help" for commands' },
    { t:'in', v:'status' },
    { t:'out', v:'✓ 6 agents · 5 online · 1 paused · GMV EGP 214M · 87 hot leads' },
  ]);
  const [cmd, setCmd] = React.useState('');
  const run = (e) => {
    e.preventDefault();
    if (!cmd.trim()) return;
    const map = {
      help:'commands: status · sync · leads · agents · clear',
      sync:'⟳ syncing Firestore listings… 42 new · 11 updated · done',
      leads:'87 hot leads · top: Mostafa Kamel (9.6) · Salma Farid (9.3)',
      agents:'Sierra 82% · Leila 64% · Scribe 71% · Curator 55% · Closer 38%',
    };
    if (cmd.trim()==='clear') { setLines([]); setCmd(''); return; }
    setLines(l=>[...l,{t:'in',v:cmd},{t:'out',v:map[cmd.trim()]||'unknown command: '+cmd}]);
    setCmd('');
  };
  return (
    <div style={{padding:'24px 28px'}}>
      <A.Card pad={false} variant="well" style={{overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'12px 16px',borderBottom:'1px solid var(--bd)'}}>
          <span style={{width:10,height:10,borderRadius:'50%',background:'var(--red)'}}></span>
          <span style={{width:10,height:10,borderRadius:'50%',background:'var(--gold)'}}></span>
          <span style={{width:10,height:10,borderRadius:'50%',background:'var(--emerald)'}}></span>
          <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--tx-f)',marginLeft:8}}>openclaw — sierra-2026</span>
        </div>
        <div style={{padding:16,fontFamily:'var(--font-mono)',fontSize:12.5,lineHeight:1.8,minHeight:200}}>
          {lines.map((l,i)=>(
            <div key={i} style={{color:l.t==='in'?'var(--tx-s)':l.t==='sys'?'var(--tx-f)':'var(--emerald)'}}>
              {l.t==='in' && <span style={{color:'var(--gold)'}}>➜ </span>}{l.v}
            </div>
          ))}
          <form onSubmit={run} style={{display:'flex',alignItems:'center',gap:8,marginTop:4}}>
            <span style={{color:'var(--gold)'}}>➜</span>
            <input value={cmd} onChange={e=>setCmd(e.target.value)} autoFocus placeholder="type a command…"
              style={{flex:1,background:'none',border:'none',outline:'none',color:'var(--tx-s)',fontFamily:'var(--font-mono)',fontSize:12.5}}/>
          </form>
        </div>
      </A.Card>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, Overview, Agents, CRM, Terminal, aRefresh });
