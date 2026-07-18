import { useState } from 'react';
import {
  LayoutDashboard,
  Database,
  Users,
  MessageSquare,
  TrendingUp,
  Settings,
  Share2,
  Lock,
  UserCircle,
  Bell,
  LogOut,
  Sparkles,
  Zap,
  Terminal,
  BarChart2,
  Bot,
  Activity,
  RefreshCw,
  FileText,
  Search,
  Cpu,
} from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { LoginPage } from './components/LoginPage';

// Portal-derived modules (Base 44 V12 skin)
import { OverviewPage }       from './components/OverviewPage';
import { AgentsPage }         from './components/AgentsPage';
import { WorkflowsPage }      from './components/WorkflowsPage';
import { OpenClawPage }       from './components/OpenClawPage';
import { CuratorPage }        from './components/CuratorPage';
import { ScribePage }         from './components/ScribePage';
import { Stage9CloserPage }   from './components/Stage9CloserPage';
import { NexusAIPage }        from './components/NexusAIPage';
import { ReportsPage }        from './components/ReportsPage';
import { ClientHub }          from './components/ClientHub';
import { EasyListingPage }    from './components/EasyListingPage';

// Original dashboard modules (functional integrations kept)
import BotsControlPage    from './components/BotsControlPage';
import FollowupsPage      from './components/FollowupsPage';
import SearchInsightsPage from './components/SearchInsightsPage';
import DBEditorPage       from './components/DBEditorPage';
import DataSyncHubPage    from './components/DataSyncHubPage';
import SettingsPage       from './components/SettingsPage';
import ListingsHubPage    from './components/ListingsHubPage';

import './index.css';

// ── Nav item type ───────────────────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  superAdminOnly?: boolean;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  // Intelligence OS
  { id: 'overview',       label: 'Intelligence OS',    icon: <LayoutDashboard size={16} />, superAdminOnly: true, section: 'Intelligence' },
  { id: 'agents',         label: 'Agents & Bots',      icon: <Bot size={16} />,             superAdminOnly: true, section: 'Intelligence' },
  { id: 'workflows',      label: 'Workflows',           icon: <Zap size={16} />,             superAdminOnly: true, section: 'Intelligence' },
  { id: 'openclaw',       label: 'OpenClaw Terminal',  icon: <Terminal size={16} />,        superAdminOnly: true, section: 'Intelligence' },
  // Operations
  { id: 'crm',            label: 'CRM · Leads',        icon: <Users size={16} />,            section: 'Operations' },
  { id: 'easylisting',    label: 'EasyListing',        icon: <Share2 size={16} />,           section: 'Operations' },
  { id: 'listings',       label: 'Listings Hub',       icon: <FileText size={16} />,         section: 'Operations' },
  { id: 'followups',      label: 'Follow-ups',         icon: <MessageSquare size={16} />,    section: 'Operations' },
  { id: 'bots',           label: 'Bot Control',        icon: <Cpu size={16} />,              superAdminOnly: true, section: 'Operations' },
  // AI Agents
  { id: 'curator',        label: 'The Curator (S3–5)', icon: <Database size={16} />,         superAdminOnly: true, section: 'Agents' },
  { id: 'scribe',         label: 'The Scribe (S1–2)',  icon: <MessageSquare size={16} />,    superAdminOnly: true, section: 'Agents' },
  { id: 'closer',         label: 'Stage-9 Closer',     icon: <TrendingUp size={16} />,       superAdminOnly: true, section: 'Agents' },
  { id: 'nexus',          label: 'Lola · Nexus AI',   icon: <Sparkles size={16} />,         section: 'Agents' },
  // Analytics & Data
  { id: 'reports',        label: 'Reports',            icon: <BarChart2 size={16} />,        superAdminOnly: true, section: 'Analytics' },
  { id: 'search',         label: 'Search Insights',    icon: <Search size={16} />,           superAdminOnly: true, section: 'Analytics' },
  { id: 'datasync',       label: 'Data Sync Hub',      icon: <RefreshCw size={16} />,        superAdminOnly: true, section: 'Analytics' },
  { id: 'dbeditor',       label: 'DB Editor',          icon: <Database size={16} />,         superAdminOnly: true, section: 'Analytics' },
  // Config
  { id: 'settings',       label: 'Settings',           icon: <Settings size={16} />,         superAdminOnly: true, section: 'Config' },
];

function AppContent() {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const userRole = user?.role || 'viewer';
  const isSuperAdmin = userRole === 'super_admin';
  // Stub translation function for original components
  const T = (key: string) => key;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#060A12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#C9A84C', fontSize: '2rem', marginBottom: '1rem' }}>
            <Activity size={40} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <p style={{ color: 'rgba(244,240,232,0.6)', fontFamily: 'Inter, sans-serif' }}>
            Loading Sierra Intelligence OS…
          </p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const handleLogout = async () => {
    try { await logout(); } catch (err) { console.error('Logout failed:', err); }
  };

  // Group nav by section, filtering super-admin-only items
  const visibleNav = NAV_ITEMS.filter(item => isSuperAdmin || !item.superAdminOnly);
  const sections = [...new Set(visibleNav.map(i => i.section))];

  return (
    <div className="dashboard-container">
      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="brand-block">
          <img src="/assets/logo-gold.png" alt="Sierra Estates" className="brand-logo" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="brand-name">SIERRA ESTATES</span>
          <span className="brand-role">
            <Lock size={10} />
            {isSuperAdmin ? 'Intelligence OS · 2027' : 'Agent Portal'}
          </span>
        </div>

        <nav className="nav-links">
          {sections.map(section => (
            <div key={section}>
              <div className="nav-section-label">{section}</div>
              {visibleNav
                .filter(item => item.section === section)
                .map(item => (
                  <div
                    key={item.id}
                    className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    {item.icon}
                    {item.label}
                  </div>
                ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar"><UserCircle size={22} /></div>
            <div>
              <p className="user-name">{user.name}</p>
              <p className="user-role">{user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', justifyContent: 'center' }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <span className="top-bar-title">
              {NAV_ITEMS.find(i => i.id === activeTab)?.label ?? 'Dashboard'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="notification-bell">
              <Bell size={19} />
              <span className="notification-dot" />
            </div>
            <div style={{ height: '18px', width: '1px', backgroundColor: 'var(--border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
              i:Sierra 2027 · v13.0
            </span>
          </div>
        </header>

        <div className="content-viewport">
          {/* Intelligence OS */}
          {activeTab === 'overview'    && <OverviewPage />}
          {activeTab === 'agents'      && <AgentsPage />}
          {activeTab === 'workflows'   && <WorkflowsPage />}
          {activeTab === 'openclaw'    && <OpenClawPage />}

          {/* Operations */}
          {activeTab === 'crm'         && <ClientHub currentUserRole={userRole} currentUserId={user.id} />}
          {activeTab === 'easylisting' && <EasyListingPage currentUserRole={userRole} currentUserId={user.id} />}
          {activeTab === 'listings'    && <ListingsHubPage T={T} />}
          {activeTab === 'followups'   && <FollowupsPage T={T} />}
          {activeTab === 'bots'        && <BotsControlPage T={T} />}

          {/* Agents */}
          {activeTab === 'curator'     && <CuratorPage />}
          {activeTab === 'scribe'      && <ScribePage />}
          {activeTab === 'closer'      && <Stage9CloserPage />}
          {activeTab === 'nexus'       && <NexusAIPage />}

          {/* Analytics */}
          {activeTab === 'reports'     && <ReportsPage />}
          {activeTab === 'search'      && <SearchInsightsPage T={T} />}
          {activeTab === 'datasync'    && <DataSyncHubPage T={T} />}
          {activeTab === 'dbeditor'    && <DBEditorPage T={T} />}

          {/* Config */}
          {activeTab === 'settings'    && <SettingsPage T={T} />}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
