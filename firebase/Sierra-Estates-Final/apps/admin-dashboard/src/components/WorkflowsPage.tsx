import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api } from '../lib/apiClient';
import {
  Calendar,
  Zap,
  UserPlus,
  Cpu,
  Layers,
  ShieldCheck,
  Database,
  Bell,
  Mail,
  Lock,
  Sliders,
  Play,
  Settings,
  FolderOpen,
  Boxes,
  Globe,
  Clock
} from 'lucide-react';

// ---------------------------------------------------------
// Custom Icons & Node Visual Styles
// ---------------------------------------------------------

const getIcon = (name?: string) => {
  switch (name) {
    case 'timer': return <Calendar className="w-4 h-4" />;
    case 'webhook': return <Zap className="w-4 h-4" />;
    case 'user': return <UserPlus className="w-4 h-4" />;
    case 'transform': return <Cpu className="w-4 h-4" />;
    case 'parse': return <Layers className="w-4 h-4" />;
    case 'check': return <ShieldCheck className="w-4 h-4" />;
    case 'db': return <Database className="w-4 h-4" />;
    case 'alert': return <Bell className="w-4 h-4" />;
    case 'email': return <Mail className="w-4 h-4" />;
    case 'lock': return <Lock className="w-4 h-4" />;
    case 'sliders': return <Sliders className="w-4 h-4" />;
    default: return <Settings className="w-4 h-4" />;
  }
};

const TriggerNode = ({ data }: any) => {
  return (
    <div className="bg-[#0a0f1d] dark:bg-[#070b16] border border-emerald-500/40 w-52 p-4 rounded-xl shadow-[0_4px_25px_rgba(16,185,129,0.12)] transition-all hover:shadow-[0_4px_30px_rgba(16,185,129,0.22)] hover:border-emerald-400">
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-emerald-500 !border-none !right-[-6px]" />
      <div className="flex items-center justify-between mb-2">
        <div className="text-[9px] text-emerald-500 font-mono uppercase tracking-wider font-bold">Trigger / Source</div>
        <div className="text-emerald-500">{getIcon(data.icon)}</div>
      </div>
      <div className="text-slate-900 dark:text-slate-100 text-xs font-semibold tracking-tight">{data.label}</div>
      {data.desc && <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal font-medium">{data.desc}</div>}
    </div>
  );
};

const ProcessNode = ({ data }: any) => {
  return (
    <div className="bg-[#0a0f1d] dark:bg-[#070b16] border border-purple-500/40 w-52 p-4 rounded-xl shadow-[0_4px_25px_rgba(168,85,247,0.12)] transition-all hover:shadow-[0_4px_30px_rgba(168,85,247,0.22)] hover:border-purple-400">
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-purple-500 !border-none !left-[-6px]" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-purple-500 !border-none !right-[-6px]" />
      <div className="flex items-center justify-between mb-2">
        <div className="text-[9px] text-purple-400 font-mono uppercase tracking-wider font-bold">Processing Block</div>
        <div className="text-purple-400">{getIcon(data.icon)}</div>
      </div>
      <div className="text-slate-900 dark:text-slate-100 text-xs font-semibold tracking-tight">{data.label}</div>
      {data.desc && <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal font-medium">{data.desc}</div>}
    </div>
  );
};

const ActionNode = ({ data }: any) => {
  return (
    <div className="bg-[#0a0f1d] dark:bg-[#070b16] border border-amber-500/40 w-52 p-4 rounded-xl shadow-[0_4px_25px_rgba(245,158,11,0.12)] transition-all hover:shadow-[0_4px_30px_rgba(245,158,11,0.22)] hover:border-amber-400">
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-amber-500 !border-none !left-[-6px]" />
      <div className="flex items-center justify-between mb-2">
        <div className="text-[9px] text-amber-500 font-mono uppercase tracking-wider font-bold">Action / Output</div>
        <div className="text-amber-500">{getIcon(data.icon)}</div>
      </div>
      <div className="text-slate-900 dark:text-slate-100 text-xs font-semibold tracking-tight">{data.label}</div>
      {data.desc && <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal font-medium">{data.desc}</div>}
    </div>
  );
};

const GateNode = ({ data }: any) => {
  return (
    <div className="bg-[#0a0f1d] dark:bg-[#070b16] border border-rose-500/40 w-52 p-4 rounded-xl shadow-[0_4px_25px_rgba(244,63,94,0.12)] transition-all hover:shadow-[0_4px_30px_rgba(244,63,94,0.22)] hover:border-rose-400">
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-rose-500 !border-none !left-[-6px]" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-rose-500 !border-none !right-[-6px]" />
      <div className="flex items-center justify-between mb-2">
        <div className="text-[9px] text-rose-500 font-mono uppercase tracking-wider font-bold">Gate / Policy</div>
        <div className="text-rose-500">{getIcon(data.icon)}</div>
      </div>
      <div className="text-slate-900 dark:text-slate-100 text-xs font-semibold tracking-tight">{data.label}</div>
      {data.desc && <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal font-medium">{data.desc}</div>}
    </div>
  );
};

const nodeTypes = {
  trigger: TriggerNode,
  process: ProcessNode,
  action: ActionNode,
  gate: GateNode,
};

// ---------------------------------------------------------
// Preset Templates Definitions
// ---------------------------------------------------------

const TEMPLATES: Record<string, { name: string; desc: string; nodes: Node[]; edges: Edge[] }> = {
  automation: {
    name: 'System Automation Flow',
    desc: 'Default backend workflow mapping events to DB writes.',
    nodes: [
      { id: 'auto-1', type: 'trigger', position: { x: 50, y: 150 }, data: { label: 'Webhook Event', icon: 'webhook', desc: 'Listen for external property uploads' } },
      { id: 'auto-2', type: 'process', position: { x: 320, y: 150 }, data: { label: 'Data Transformation', icon: 'transform', desc: 'Sanitize strings & adjust currencies' } },
      { id: 'auto-3', type: 'action', position: { x: 600, y: 150 }, data: { label: 'Database Sync', icon: 'db', desc: 'Write output into listings collection' } },
    ],
    edges: [
      { id: 'e-auto-1-2', source: 'auto-1', target: 'auto-2', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
      { id: 'e-auto-2-3', source: 'auto-2', target: 'auto-3', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } },
    ]
  },
  pipeline: {
    name: 'CI/CD Deployment Pipeline',
    desc: 'Architecture patterns for multi-stage deployments with approval gates.',
    nodes: [
      { id: 'pipe-1', type: 'trigger', position: { x: 50, y: 150 }, data: { label: 'Source Push (main)', icon: 'webhook', desc: 'Triggers on github branch merge' } },
      { id: 'pipe-2', type: 'process', position: { x: 320, y: 150 }, data: { label: 'Docker Compile & Build', icon: 'transform', desc: 'Compiles admin dashboard bundle' } },
      { id: 'pipe-3', type: 'process', position: { x: 600, y: 150 }, data: { label: 'Trivy Scan & Unit Suite', icon: 'check', desc: 'Security audit & unit suite check' } },
      { id: 'pipe-4', type: 'gate', position: { x: 880, y: 150 }, data: { label: 'Staging Approval Gate', icon: 'lock', desc: 'Requires Lead Engineer manual sign-off' } },
      { id: 'pipe-5', type: 'action', position: { x: 1160, y: 150 }, data: { label: 'Canary Deploy (10%)', icon: 'db', desc: 'Deploy rolling updates to Cloud Run' } },
    ],
    edges: [
      { id: 'e-pipe-1-2', source: 'pipe-1', target: 'pipe-2', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
      { id: 'e-pipe-2-3', source: 'pipe-2', target: 'pipe-3', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } },
      { id: 'e-pipe-3-4', source: 'pipe-3', target: 'pipe-4', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } },
      { id: 'e-pipe-4-5', source: 'pipe-4', target: 'pipe-5', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
    ]
  },
  api: {
    name: 'API Design Lifecycle',
    desc: 'REST & GraphQL endpoint lifecycle with validation & rate limiting.',
    nodes: [
      { id: 'api-1', type: 'trigger', position: { x: 50, y: 150 }, data: { label: 'HTTP /api/v1/leads', icon: 'webhook', desc: 'Client GET/POST request inbound' } },
      { id: 'api-2', type: 'process', position: { x: 320, y: 150 }, data: { label: 'Pydantic Input Validator', icon: 'sliders', desc: 'Enforces type check & schema matching' } },
      { id: 'api-3', type: 'gate', position: { x: 600, y: 150 }, data: { label: 'Rate Limiter Guard', icon: 'lock', desc: 'Limit 60 calls/min per client IP' } },
      { id: 'api-4', type: 'process', position: { x: 880, y: 150 }, data: { label: 'DataLoader Resolver', icon: 'parse', desc: 'Prevent N+1 database batch query loop' } },
      { id: 'api-5', type: 'action', position: { x: 1160, y: 150 }, data: { label: 'JSON Payload Response', icon: 'db', desc: 'HATEOAS compliant status response' } },
    ],
    edges: [
      { id: 'e-api-1-2', source: 'api-1', target: 'api-2', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
      { id: 'e-api-2-3', source: 'api-2', target: 'api-3', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } },
      { id: 'e-api-3-4', source: 'api-3', target: 'api-4', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
      { id: 'e-api-4-5', source: 'api-4', target: 'api-5', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } },
    ]
  }
};

// ---------------------------------------------------------
// Page Component
// ---------------------------------------------------------

interface WorkflowsPageProps {
  T: (key: string) => string;
  isAr?: boolean;
  searchQuery?: string;
}

export default function WorkflowsPage({ T, isAr }: WorkflowsPageProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(TEMPLATES.automation.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(TEMPLATES.automation.edges);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workflowId, setWorkflowId] = useState<string>('');
  const [activeTemplateKey, setActiveTemplateKey] = useState<string>('automation');

  const onConnect = useCallback((params: Connection | Edge) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { strokeWidth: 2, stroke: '#94a3b8' } } as any, eds));
  }, [setEdges]);

  // Load selected template setup
  const loadTemplate = useCallback((key: string) => {
    const tmpl = TEMPLATES[key];
    if (!tmpl) return;
    setActiveTemplateKey(key);
    setNodes(tmpl.nodes);
    setEdges(tmpl.edges);
  }, [setNodes, setEdges]);

  // Fetch workflow state from API on initial load
  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const res = await api.get<{ workflows: any[] }>('/api/admin/workflows');
        const defaultWf = res.workflows.find(w => w.name === 'DataFlow Editor') || res.workflows[0];

        if (defaultWf && defaultWf.graphData) {
          setWorkflowId(defaultWf.id);
          setNodes(defaultWf.graphData.nodes || TEMPLATES.automation.nodes);
          setEdges(defaultWf.graphData.edges || TEMPLATES.automation.edges);
        } else if (defaultWf) {
          setWorkflowId(defaultWf.id);
        } else {
          // Create default document in DB
          const createRes = await api.post<{ id: string }>('/api/admin/workflows', {
            name: 'DataFlow Editor',
            desc: 'Primary visual execution graph',
            status: 'active',
            runs: 0,
            last: 'Never',
            graphData: { nodes: TEMPLATES.automation.nodes, edges: TEMPLATES.automation.edges }
          });
          if (createRes.id) setWorkflowId(createRes.id);
        }
      } catch (err) {
        console.error('Failed to load workflow data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflow();
  }, [setNodes, setEdges]);

  const onSave = async () => {
    if (!workflowId) return;
    setSaving(true);
    try {
      await api.patch(`/api/admin/workflows/${workflowId}`, {
        graphData: { nodes, edges },
      });
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setTimeout(() => setSaving(false), 500);
    }
  };

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string, icon: string, desc: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label, icon, desc }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      const dataStr = event.dataTransfer.getData('application/reactflow');

      if (!dataStr || !reactFlowBounds) return;

      const data = JSON.parse(dataStr);
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: data.type,
        position,
        data: { label: data.label, icon: data.icon, desc: data.desc },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 font-mono animate-pulse">
        Initializing DataFlow Engine...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 animate-fade-in-up">
      {/* Sidebar Nodes Palette */}
      <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-[#0a0f1d]/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-lg flex flex-col z-10">
        
        {/* Template Selector Panel */}
        <div className="mb-6 pb-5 border-b border-slate-200 dark:border-slate-800">
          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-widest font-bold block mb-2">
            📂 Presets & Architectures
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {Object.entries(TEMPLATES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => loadTemplate(key)}
                className={`w-full py-2 px-3 rounded-lg text-left transition-all flex items-center gap-2.5 ${
                  activeTemplateKey === key
                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-500 dark:text-blue-400'
                    : 'bg-slate-50 dark:bg-slate-900/30 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <div>
                  <div className="text-xs font-semibold">{value.name}</div>
                  <div className="text-[9px] opacity-75 truncate max-w-[200px]">{value.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Node library palette list */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900 dark:text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2">
            <Boxes className="w-4 h-4 text-gold-lt" />
            {isAr ? 'كتلة الأوامر' : 'Node Palette Library'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar">
          {/* CI/CD Category */}
          <div>
            <div className="text-[9px] text-cyan-500 mb-2 uppercase font-mono tracking-widest font-bold">Deployment & CI/CD</div>
            <div className="space-y-1.5">
              <div
                className="p-2.5 bg-white dark:bg-[#040710] border border-emerald-500/30 rounded-lg cursor-grab hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.12)] transition-all flex items-center gap-3 group"
                onDragStart={(e) => onDragStart(e, 'trigger', 'Source Pipeline Push', 'webhook', 'Triggers build on push/merge to repo')}
                draggable
              >
                <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500">📥</div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-emerald-500 transition-colors">Source Code Push</span>
              </div>
              <div
                className="p-2.5 bg-white dark:bg-[#040710] border border-purple-500/30 rounded-lg cursor-grab hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.12)] transition-all flex items-center gap-3 group"
                onDragStart={(e) => onDragStart(e, 'process', 'Docker Build & Package', 'transform', 'Build container images')}
                draggable
              >
                <div className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center text-purple-500">🐳</div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-purple-500 transition-colors">Docker Build</span>
              </div>
              <div
                className="p-2.5 bg-white dark:bg-[#040710] border border-rose-500/30 rounded-lg cursor-grab hover:border-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.12)] transition-all flex items-center gap-3 group"
                onDragStart={(e) => onDragStart(e, 'gate', 'Staging Approval Gate', 'lock', 'Manual review gate before prod release')}
                draggable
              >
                <div className="w-6 h-6 rounded bg-rose-500/10 flex items-center justify-center text-rose-500"><Lock className="w-3.5 h-3.5" /></div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-rose-500 transition-colors">Approval Gate</span>
              </div>
            </div>
          </div>

          {/* API Design Category */}
          <div>
            <div className="text-[9px] text-purple-400 mb-2 uppercase font-mono tracking-widest font-bold">API Architecture</div>
            <div className="space-y-1.5">
              <div
                className="p-2.5 bg-white dark:bg-[#040710] border border-emerald-500/30 rounded-lg cursor-grab hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.12)] transition-all flex items-center gap-3 group"
                onDragStart={(e) => onDragStart(e, 'trigger', 'HTTP Request Noun', 'webhook', 'Inbound REST API or GraphQL call')}
                draggable
              >
                <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Globe className="w-3.5 h-3.5" /></div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-emerald-500 transition-colors">Client Request</span>
              </div>
              <div
                className="p-2.5 bg-white dark:bg-[#040710] border border-purple-500/30 rounded-lg cursor-grab hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.12)] transition-all flex items-center gap-3 group"
                onDragStart={(e) => onDragStart(e, 'process', 'Joi Input Validation', 'sliders', 'Validates JSON request payload structure')}
                draggable
              >
                <div className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center text-purple-500"><ShieldCheck className="w-3.5 h-3.5" /></div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-purple-500 transition-colors">Request Validator</span>
              </div>
              <div
                className="p-2.5 bg-white dark:bg-[#040710] border border-rose-500/30 rounded-lg cursor-grab hover:border-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.12)] transition-all flex items-center gap-3 group"
                onDragStart={(e) => onDragStart(e, 'gate', 'Rate Limit Guard', 'lock', 'Limit connections by client IP')}
                draggable
              >
                <div className="w-6 h-6 rounded bg-rose-500/10 flex items-center justify-center text-rose-500"><Clock className="w-3.5 h-3.5" /></div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-rose-500 transition-colors">Rate Limiter</span>
              </div>
              <div
                className="p-2.5 bg-white dark:bg-[#040710] border border-purple-500/30 rounded-lg cursor-grab hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.12)] transition-all flex items-center gap-3 group"
                onDragStart={(e) => onDragStart(e, 'process', 'DataLoader DB Resolver', 'parse', 'Batches SQL/NoSQL queries to avoid N+1 load')}
                draggable
              >
                <div className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center text-purple-500"><Layers className="w-3.5 h-3.5" /></div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-purple-500 transition-colors">DataLoader Resolver</span>
              </div>
            </div>
          </div>

          {/* Standard Automations Category */}
          <div>
            <div className="text-[9px] text-amber-500 mb-2 uppercase font-mono tracking-widest font-bold">Standard Actions</div>
            <div className="space-y-1.5">
              <div
                className="p-2.5 bg-white dark:bg-[#040710] border border-amber-500/30 rounded-lg cursor-grab hover:border-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] transition-all flex items-center gap-3 group"
                onDragStart={(e) => onDragStart(e, 'action', 'Database Sync Action', 'db', 'Save/Patch record into Firestore')}
                draggable
              >
                <div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center text-amber-500"><Database className="w-3.5 h-3.5" /></div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-amber-500 transition-colors">Database Sync</span>
              </div>
              <div
                className="p-2.5 bg-white dark:bg-[#040710] border border-amber-500/30 rounded-lg cursor-grab hover:border-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] transition-all flex items-center gap-3 group"
                onDragStart={(e) => onDragStart(e, 'action', 'Slack/Telegram Dispatch', 'alert', 'Notify team of build status')}
                draggable
              >
                <div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center text-amber-500"><Bell className="w-3.5 h-3.5" /></div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-amber-500 transition-colors">Dispatch Alert</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onSave}
          disabled={saving}
          className="mt-5 w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] transition-all disabled:opacity-50 active:scale-95"
        >
          {saving ? 'Saving...' : 'Deploy DataFlow'}
        </button>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 min-h-[500px] lg:min-h-0 bg-white dark:bg-[#040710] border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-inner relative z-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          className="bg-slate-50 dark:bg-[#02040a]"
        >
          <Background color="#808080" gap={24} size={1} />
          
          <Controls className="!bg-white/80 dark:!bg-[#0a0f1d]/80 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-xl rounded-md overflow-hidden !fill-slate-700 dark:!fill-slate-300" />
          
          <MiniMap
            className="!bg-white/80 dark:!bg-[#0a0f1d]/80 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-xl rounded-md"
            nodeColor={(node) => {
              if (node.type === 'trigger') return '#10b981';
              if (node.type === 'process') return '#a855f7';
              if (node.type === 'action') return '#f59e0b';
              if (node.type === 'gate') return '#f43f5e';
              return '#475569';
            }}
            maskColor="rgba(0,0,0,0.1)"
            nodeBorderRadius={8}
          />
          
          <Panel position="top-left" className="bg-white/80 dark:bg-slate-900/80 backdrop-blur text-slate-900 dark:text-white px-4 py-2 rounded-lg text-xs font-mono font-bold shadow-sm border border-slate-200 dark:border-slate-700">
            System DataFlow Editor V2
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

