import React, { useState, useEffect } from 'react';
import { api } from '../lib/apiClient';

interface SyncResult {
  success: boolean;
  synced: number;
  errors: number;
  total: number;
  message: string;
}

export default function DataSyncHubPage() {
  const [syncingListings, setSyncingListings] = useState(false);
  const [syncingLeads, setSyncingLeads] = useState(false);
  const [listingsResult, setListingsResult] = useState<SyncResult | null>(null);
  const [leadsResult, setLeadsResult] = useState<SyncResult | null>(null);
  const [apiStatus, setApiStatus] = useState<{ pfConfigured: boolean; twilioConfigured: boolean }>({
    pfConfigured: true, // We assume true but will check if we can query health
    twilioConfigured: true,
  });

  const handleSyncListings = async () => {
    setSyncingListings(true);
    setListingsResult(null);
    try {
      const res = await api.post<SyncResult>('/api/pf/sync/listings');
      setListingsResult(res);
    } catch (err: any) {
      console.error(err);
      setListingsResult({
        success: false,
        synced: 0,
        errors: 1,
        total: 0,
        message: err.message || 'Failed to sync listings from PropertyFinder',
      });
    } finally {
      setSyncingListings(false);
    }
  };

  const handleSyncLeads = async () => {
    setSyncingLeads(true);
    setLeadsResult(null);
    try {
      const res = await api.post<SyncResult>('/api/pf/sync/leads');
      setLeadsResult(res);
    } catch (err: any) {
      console.error(err);
      setLeadsResult({
        success: false,
        synced: 0,
        errors: 1,
        total: 0,
        message: err.message || 'Failed to sync leads from PropertyFinder',
      });
    } finally {
      setSyncingLeads(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center">
          <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold select-none">
            🔄 DATA SYNC & INTEGRATION HUB
          </span>
          <div className="flex gap-2 text-[9px] font-mono">
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/20 text-emerald-400">
              PROPERTYFINDER: ACTIVE
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/20 text-emerald-400">
              TWILIO: ACTIVE
            </span>
          </div>
        </div>
        
        <div className="p-5 space-y-6">
          {/* PropertyFinder Sync Card */}
          <div className="bg-slate-950/80 border border-cyan-500/10 rounded-lg p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-cyan-500/5 px-3 py-1 rounded-bl text-[9px] font-mono text-cyan-400 uppercase tracking-widest border-l border-b border-cyan-500/10">
              Core Channel
            </div>
            
            <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <span className="text-base">🚀</span> PropertyFinder Atlas Sync Center
            </h3>
            <p className="text-slate-400 text-xs mb-6 max-w-2xl">
              Perform on-demand synchronization of your listings and leads directly from the PropertyFinder Atlas OAuth2 API into Sierra Estates' real-time Firestore database.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Listings Sync */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-slate-200 text-xs font-bold mb-1 uppercase tracking-wider">Sync Listings</h4>
                  <p className="text-slate-400 text-[11px] mb-4">
                    Pull current property inventory, map coordinates, bedrooms, area, price, and media attachments.
                  </p>
                </div>
                <div>
                  {listingsResult && (
                    <div className={`p-3 rounded-lg text-xs mb-3 font-mono ${listingsResult.success ? 'bg-emerald-950/40 border border-emerald-500/20 text-emerald-300' : 'bg-red-950/40 border border-red-500/20 text-red-300'}`}>
                      {listingsResult.message}
                      {listingsResult.success && (
                        <div className="mt-1 text-[10px] text-slate-400">
                          Synced: {listingsResult.synced} | Errors: {listingsResult.errors}
                        </div>
                      )}
                    </div>
                  )}
                  <button 
                    onClick={handleSyncListings}
                    disabled={syncingListings}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded text-xs font-bold font-mono uppercase transition duration-150 active:scale-98 disabled:opacity-50"
                  >
                    {syncingListings ? 'Syncing Listings...' : '🔄 Run Listings Sync'}
                  </button>
                </div>
              </div>

              {/* Leads Sync */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-slate-200 text-xs font-bold mb-1 uppercase tracking-wider">Sync Leads & Inquiries</h4>
                  <p className="text-slate-400 text-[11px] mb-4">
                    Fetch raw lead logs, phone inquiries, and compound interest details. Auto-assigned to least busy agents.
                  </p>
                </div>
                <div>
                  {leadsResult && (
                    <div className={`p-3 rounded-lg text-xs mb-3 font-mono ${leadsResult.success ? 'bg-emerald-950/40 border border-emerald-500/20 text-emerald-300' : 'bg-red-950/40 border border-red-500/20 text-red-300'}`}>
                      {leadsResult.message}
                      {leadsResult.success && (
                        <div className="mt-1 text-[10px] text-slate-400">
                          Imported: {leadsResult.synced} | Errors: {leadsResult.errors}
                        </div>
                      )}
                    </div>
                  )}
                  <button 
                    onClick={handleSyncLeads}
                    disabled={syncingLeads}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded text-xs font-bold font-mono uppercase transition duration-150 active:scale-98 disabled:opacity-50"
                  >
                    {syncingLeads ? 'Syncing Leads...' : '🔄 Run Leads Sync'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-5">
              <h3 className="text-white font-bold mb-2">Google Sheets / CSV Hub</h3>
              <p className="text-slate-400 text-xs mb-4">Connect dynamic spreadsheet templates and map raw data drops.</p>
              <button className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded text-xs font-mono uppercase">
                Connect Spreadsheets
              </button>
            </div>
            
            <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-5">
              <h3 className="text-white font-bold mb-2">Inbound Email Scraping (Gmail Sync)</h3>
              <p className="text-slate-400 text-xs mb-4">Setup automated mailbox scraping and document parsing pipelines.</p>
              <button className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded text-xs font-mono uppercase">
                Authenticate Gmail API
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
