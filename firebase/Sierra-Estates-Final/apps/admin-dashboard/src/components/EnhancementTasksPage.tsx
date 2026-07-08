import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TaskItem {
  title: string;
  completed: boolean;
}

interface TaskGroup {
  id: string;
  phase: string;
  items: TaskItem[];
}

interface CRMSummary {
  total: number;
  new: number;
  qualified: number;
  negotiating: number;
  closed: number;
  lost: number;
  whatsapp?: number;
}

// ─── Phase color map ─────────────────────────────────────────────────────────
const PHASE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  phase1: { bg: '#1e3a5f', border: '#3b82f6', text: '#60a5fa' },
  phase2: { bg: '#3d2e0a', border: '#f59e0b', text: '#fbbf24' },
  phase3: { bg: '#0d3323', border: '#10b981', text: '#34d399' },
  phase4: { bg: '#2e1a4f', border: '#8b5cf6', text: '#a78bfa' },
  phase5: { bg: '#3d1515', border: '#ef4444', text: '#f87171' },
};

// ─── Stat Badge ───────────────────────────────────────────────────────────────
const StatBadge = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '12px 16px', borderRadius: 10,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    minWidth: 90,
  }}>
    <span style={{ fontSize: 28, fontWeight: 700, color }}>{value}</span>
    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{label}</span>
  </div>
);

// ─── Enhancement Tasks Page ───────────────────────────────────────────────────
export default function EnhancementTasksPage() {
  const [tasks, setTasks] = useState<TaskGroup[]>([]);
  const [summary, setSummary] = useState<CRMSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, summaryRes] = await Promise.all([
        api.get<{ success: boolean; tasks: TaskGroup[] }>('/api/admin/enhancement-tasks'),
        api.get<{ success: boolean; summary: CRMSummary }>('/api/admin/crm-summary'),
      ]);
      if (tasksRes.success) setTasks(tasksRes.tasks);
      if (summaryRes.success) setSummary(summaryRes.summary);
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleToggle = async (group: TaskGroup, itemIndex: number) => {
    const key = `${group.id}-${itemIndex}`;
    setToggling(key);
    const newItems = group.items.map((item, i) =>
      i === itemIndex ? { ...item, completed: !item.completed } : item
    );
    try {
      await api.patch(`/api/admin/enhancement-tasks/${group.id}`, { items: newItems });
      setTasks(prev => prev.map(g =>
        g.id === group.id ? { ...g, items: newItems } : g
      ));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setToggling(null);
    }
  };

  const totalItems = tasks.reduce((sum, g) => sum + g.items.length, 0);
  const completedItems = tasks.reduce((sum, g) => sum + g.items.filter(i => i.completed).length, 0);
  const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div className="admin-spinner" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e9c176', margin: 0 }}>
          🤖 Antigravity Enhancement Plan
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 6, fontSize: 14 }}>
          Powered by Hermes Agent · OpenClaw AI · Firebase · WhatsApp Business API
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
          borderRadius: 10, padding: '12px 16px', color: '#f87171', marginBottom: 24,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Overall Progress */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: 24, marginBottom: 32,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ color: '#fff', fontWeight: 600 }}>Overall Progress</span>
          <span style={{ color: '#e9c176', fontWeight: 700 }}>
            {completedItems}/{totalItems} tasks
          </span>
        </div>
        <div style={{
          height: 8, background: 'rgba(255,255,255,0.08)',
          borderRadius: 4, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${overallProgress}%`,
            background: 'linear-gradient(90deg, #c8961a, #e9c176)',
            borderRadius: 4, transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
          {overallProgress.toFixed(0)}% complete
        </div>
      </div>

      {/* CRM Summary */}
      {summary && (
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: 24, marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e9c176', marginTop: 0, marginBottom: 20 }}>
            📊 Hermes CRM — Live Leads
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <StatBadge label="Total" value={summary.total} color="#60a5fa" />
            <StatBadge label="New" value={summary.new} color="#e9c176" />
            <StatBadge label="Qualified" value={summary.qualified} color="#34d399" />
            <StatBadge label="Negotiating" value={summary.negotiating} color="#fb923c" />
            <StatBadge label="Closed 🏆" value={summary.closed} color="#a78bfa" />
            <StatBadge label="Lost" value={summary.lost} color="#f87171" />
            {summary.whatsapp !== undefined && (
              <StatBadge label="Via WhatsApp" value={summary.whatsapp} color="#25d366" />
            )}
          </div>
        </div>
      )}

      {/* Phase Task Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {tasks.map((group) => {
          const colors = PHASE_COLORS[group.id] || PHASE_COLORS.phase1;
          const done = group.items.filter(i => i.completed).length;
          const total = group.items.length;
          const progress = total > 0 ? (done / total) * 100 : 0;

          return (
            <div key={group.id} style={{
              background: colors.bg, border: `1px solid ${colors.border}33`,
              borderRadius: 14, padding: 24,
              transition: 'box-shadow 0.2s',
            }}>
              {/* Phase header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{
                  background: `${colors.border}22`, border: `1px solid ${colors.border}`,
                  color: colors.text, fontSize: 11, fontWeight: 700,
                  padding: '3px 10px', borderRadius: 6, letterSpacing: 1,
                  textTransform: 'uppercase',
                }}>
                  {group.id}
                </span>
                <h3 style={{ color: '#fff', margin: 0, fontSize: 15, fontWeight: 600 }}>
                  {group.phase}
                </h3>
                <span style={{ marginLeft: 'auto', color: colors.text, fontSize: 13, fontWeight: 600 }}>
                  {done}/{total}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{
                height: 4, background: 'rgba(255,255,255,0.08)',
                borderRadius: 2, marginBottom: 16, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${progress}%`,
                  background: colors.border,
                  borderRadius: 2, transition: 'width 0.4s ease',
                }} />
              </div>

              {/* Task items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.items.map((item, i) => {
                  const key = `${group.id}-${i}`;
                  const isToggling = toggling === key;

                  return (
                    <button
                      key={i}
                      onClick={() => handleToggle(group, i)}
                      disabled={isToggling}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: 'none', border: 'none', cursor: isToggling ? 'wait' : 'pointer',
                        padding: '8px 0', textAlign: 'left', opacity: isToggling ? 0.6 : 1,
                      }}
                    >
                      {/* Checkbox */}
                      <div style={{
                        width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                        border: `2px solid ${item.completed ? colors.border : 'rgba(255,255,255,0.2)'}`,
                        background: item.completed ? colors.border : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}>
                        {item.completed && (
                          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                            <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      {/* Label */}
                      <span style={{
                        color: item.completed ? 'rgba(255,255,255,0.35)' : '#fff',
                        fontSize: 14, lineHeight: '20px',
                        textDecoration: item.completed ? 'line-through' : 'none',
                        transition: 'all 0.15s',
                      }}>
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hermes Runtime Info */}
      <div style={{
        background: 'rgba(200,150,26,0.08)', border: '1px solid rgba(200,150,26,0.3)',
        borderRadius: 14, padding: 24, marginTop: 32,
      }}>
        <h3 style={{ color: '#e9c176', marginTop: 0, fontSize: 16 }}>⚙️ Hermes Runtime</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            ['JS Engine', 'Hermes ✅'],
            ['AI Gateway', 'OpenClaw v2026'],
            ['Crypto', 'react-native-ecc ✅'],
            ['Database', 'Firebase Firestore (sierra-blu)'],
            ['WhatsApp Webhook', '/api/webhook/whatsapp'],
            ['Hermes Chat API', '/api/hermes/chat'],
            ['Admin Backend', 'VITE_BACKEND_API_URL'],
            ['Lead Collection', 'Firestore → leads'],
          ].map(([label, value]) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.04)',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{label}</span>
              <span style={{ color: '#34d399', fontSize: 13, fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: '#e9c176' }}>WhatsApp Setup:</strong> Register your backend URL as a Meta webhook at
            Meta Developer Console → Your App → WhatsApp → Configuration.
            Webhook URL: <code style={{ color: '#60a5fa' }}>https://your-backend.vercel.app/api/webhook/whatsapp</code>
            &nbsp;· Verify Token: <code style={{ color: '#60a5fa' }}>sierra_hermes_2026</code>
          </p>
        </div>
      </div>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <button
          onClick={loadAll}
          style={{
            background: 'rgba(200,150,26,0.15)', border: '1px solid rgba(200,150,26,0.4)',
            color: '#e9c176', borderRadius: 10, padding: '10px 24px',
            cursor: 'pointer', fontSize: 14, fontWeight: 600,
          }}
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}
