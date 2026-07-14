/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  Sierra Estates — Dashboard Widgets (wired to Firestore)
 *  File: SE/apps/admin/src/components/dashboard/DashboardWidgets.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Real-time dashboard widgets that subscribe to Firestore collections.
 *  Displays: listing counts, open requests, recent inquiries, agent leaderboard.
 *  Uses the typed firebaseUtils for all data access.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import {
  Building2, MessageSquare, Users, TrendingUp, Clock,
  CheckCircle2, AlertCircle, Loader2, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  subscribeToListings, subscribeToOpenRequests,
  fetchClients, fetchAgents,
} from '../../services/firebaseUtils';
import type { Listing, Request, Client, Agent } from '../../types';

/* ═══════════════════════════════════════════════════════════════════════════
 *  DASHBOARD WIDGETS CONTAINER
 * ═══════════════════════════════════════════════════════════════════════════ */

export default function DashboardWidgets() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubListings: (() => void) | undefined;
    let unsubRequests: (() => void) | undefined;

    try {
      // Real-time subscriptions
      unsubListings = subscribeToListings(
        (data) => setListings(data),
        'active' as any
      );
      unsubRequests = subscribeToOpenRequests(setRequests);

      // One-time fetches
      fetchClients(10).then(setClients).catch(() => {});
      fetchAgents().then(setAgents).catch(() => {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

    return () => {
      if (unsubListings) unsubListings();
      if (unsubRequests) unsubRequests();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
        <AlertCircle size={16} /> {error}
      </div>
    );
  }

  // Calculate stats
  const activeListings = listings.filter(l => l.status === 'active').length;
  const draftListings = listings.filter(l => l.status === 'draft').length;
  const soldListings = listings.filter(l => l.status === 'sold').length;
  const botHandling = requests.filter(r => r.status === 'bot_handling').length;
  const readyForAgent = requests.filter(r => r.status === 'ready_for_agent').length;
  const totalValue = listings.reduce((sum, l) => sum + (l.price_egp || 0), 0);

  return (
    <div className="space-y-6">
      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="Active Listings"
          value={activeListings.toString()}
          subtext={`${draftListings} draft · ${soldListings} sold`}
          color="blue"
          trend="+12%"
          trendUp
        />
        <StatCard
          icon={MessageSquare}
          label="Open Requests"
          value={requests.length.toString()}
          subtext={`${botHandling} bot · ${readyForAgent} agent`}
          color="yellow"
          trend="+5"
          trendUp
        />
        <StatCard
          icon={Users}
          label="Total Clients"
          value={clients.length.toString()}
          subtext="Last 10 shown"
          color="green"
          trend="+3"
          trendUp
        />
        <StatCard
          icon={TrendingUp}
          label="Portfolio Value"
          value={`${(totalValue / 1000000).toFixed(1)}M EGP`}
          subtext={`${listings.length} listings total`}
          color="purple"
          trend="+8.2%"
          trendUp
        />
      </div>

      {/* ── Two Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Inquiries</h3>
            <span className="text-xs text-gray-400">{clients.length} clients</span>
          </div>
          {clients.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No clients yet</p>
          ) : (
            <div className="space-y-2">
              {clients.slice(0, 5).map(client => (
                <div key={client.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{client.name}</div>
                    <div className="text-xs text-gray-500">{client.phone_number}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {client.lead_source.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Open Request Tickets */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Open Request Tickets</h3>
            <span className="text-xs text-gray-400">{requests.length} open</span>
          </div>
          {requests.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No open requests</p>
          ) : (
            <div className="space-y-2">
              {requests.slice(0, 5).map(req => {
                const lastMsg = req.bot_chat_history[req.bot_chat_history.length - 1];
                return (
                  <div key={req.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className={`w-2 h-2 rounded-full flex-none ${
                      req.status === 'bot_handling' ? 'bg-yellow-400' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {lastMsg?.text || 'No messages'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {req.status === 'bot_handling' ? '🤖 Bot handling' : '👤 Ready for agent'}
                        {' · '}
                        {req.matched_listings.length} matches
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Agent Leaderboard ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Agent Leaderboard</h3>
          <span className="text-xs text-gray-400">{agents.length} active agents</span>
        </div>
        {agents.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No agents yet</p>
        ) : (
          <div className="space-y-2">
            {agents.map((agent, i) => (
              <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700' :
                  i === 1 ? 'bg-gray-200 text-gray-700' :
                  i === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                  <div className="text-xs text-gray-500">{agent.email}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  agent.role === 'super_admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {agent.role.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  STAT CARD COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ icon: Icon, label, value, subtext, color, trend, trendUp }: {
  icon: any;
  label: string;
  value: string;
  subtext: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  trend: string;
  trendUp: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
      <div className="text-xs text-gray-400">{subtext}</div>
    </div>
  );
}
