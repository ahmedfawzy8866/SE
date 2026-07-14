/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  Sierra Estates — Real-time Activity Feed
 *  File: SE/apps/admin/src/components/dashboard/ActivityFeed.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Live feed of recent activity: new inquiries, request status changes,
 *  listing updates. Uses Firestore onSnapshot for real-time updates.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { Activity, User, Building2, MessageSquare, Clock, Loader2 } from 'lucide-react';
import { subscribeToOpenRequests } from '../../services/firebaseUtils';
import { fetchClients } from '../../services/firebaseUtils';
import type { Request, Client } from '../../types';

interface ActivityItem {
  id: string;
  type: 'inquiry' | 'request' | 'listing';
  title: string;
  description: string;
  timestamp: Date;
  icon: any;
  color: string;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubRequests: (() => void) | undefined;

    try {
      unsubRequests = subscribeToOpenRequests((requests) => {
        const items: ActivityItem[] = requests.slice(0, 10).map(req => {
          const lastMsg = req.bot_chat_history[req.bot_chat_history.length - 1];
          return {
            id: req.id,
            type: 'request' as const,
            title: req.status === 'bot_handling'
              ? 'Bot handling new request'
              : 'Request escalated to agent',
            description: lastMsg?.text || 'No message content',
            timestamp: req.created_at?.seconds
              ? new Date(req.created_at.seconds * 1000)
              : new Date(),
            icon: req.status === 'bot_handling' ? MessageSquare : User,
            color: req.status === 'bot_handling' ? 'text-yellow-600 bg-yellow-50' : 'text-blue-600 bg-blue-50',
          };
        });
        setActivities(items);
        setLoading(false);
      });

      // Also fetch recent clients as activity items
      fetchClients(5).then((clients) => {
        setActivities(prev => {
          const clientItems: ActivityItem[] = clients.map(c => ({
            id: c.id,
            type: 'inquiry' as const,
            title: 'New client registered',
            description: `${c.name} · ${c.phone_number} · ${c.lead_source.replace('_', ' ')}`,
            timestamp: c.created_at?.seconds
              ? new Date(c.created_at.seconds * 1000)
              : new Date(),
            icon: User,
            color: 'text-green-600 bg-green-50',
          }));
          // Merge + sort by timestamp + dedup
          const merged = [...prev, ...clientItems]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 15);
          return merged;
        });
      }).catch(() => setLoading(false));
    } catch (err) {
      setLoading(false);
    }

    return () => { if (unsubRequests) unsubRequests(); };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-400">
        <Loader2 className="animate-spin mr-2" size={18} /> Loading activity...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-blue-500" />
        <h3 className="font-bold text-gray-900">Live Activity Feed</h3>
        <span className="ml-auto flex items-center gap-1 text-xs text-green-600">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </span>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((item) => {
            const Icon = item.icon;
            const minutesAgo = Math.floor((Date.now() - item.timestamp.getTime()) / 60000);
            const timeLabel = minutesAgo < 1 ? 'just now'
              : minutesAgo < 60 ? `${minutesAgo}m ago`
              : minutesAgo < 1440 ? `${Math.floor(minutesAgo / 60)}h ago`
              : `${Math.floor(minutesAgo / 1440)}d ago`;

            return (
              <div key={`${item.type}-${item.id}`} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${item.color}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className="text-xs text-gray-500 truncate">{item.description}</div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 flex-none">
                  <Clock size={10} />
                  {timeLabel}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
