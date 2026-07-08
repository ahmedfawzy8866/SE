import React from 'react';

export default function DataSyncHubPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/40">
          <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold select-none">
            🔄 DATA SYNC & INTEGRATION HUB
          </span>
        </div>
        <div className="p-5 space-y-6">
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
