/* Sierra Estates — Admin Intelligence OS root. */
function AdminApp() {
  const [active, setActive] = React.useState('Intelligence OS');
  React.useEffect(() => { window.aRefresh(); });
  const screen =
    active === 'Agents & Bots' ? <Agents/> :
    active === 'CRM Leads' ? <CRM/> :
    active === 'OpenClaw' ? <Terminal/> :
    <Overview/>;
  const title =
    active === 'Intelligence OS' ? 'Command Overview' :
    active === 'Agents & Bots' ? 'Agents & Bots' :
    active === 'CRM Leads' ? 'CRM Leads' :
    active === 'OpenClaw' ? 'OpenClaw Terminal' : active;
  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar nav={window.SE_NAV} active={active} setActive={setActive}/>
      <main style={{flex:1,minWidth:0}}>
        <Topbar title={title}/>
        {screen}
      </main>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<AdminApp/>);
