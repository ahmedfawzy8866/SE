"use client";
/**
 * Settings — admin-only site configuration toggles.
 * In sandbox these are local-only (localStorage). With Firebase Admin
 * configured they would write to /config doc in Firestore.
 */
import { useEffect, useState } from "react";
import { Settings as Cog, Save, Building2, Globe, Bell, Shield } from "lucide-react";
import { useToast } from "@/components/client/Toast";

const DEFAULTS = {
  siteName: "Sierra Estates",
  siteTagline: "New Cairo Properties",
  defaultLocale: "en" as "en" | "ar",
  enableInquiries: true,
  enableLeadsWebhook: true,
  enableAI: true,
  maintenanceMode: false,
};

export function SettingsView() {
  const { toast } = useToast();
  const [cfg, setCfg] = useState(DEFAULTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sierra_admin_settings");
      if (stored) setCfg({ ...DEFAULTS, ...JSON.parse(stored) });
    } catch {}
  }, []);

  function save() {
    try {
      localStorage.setItem("sierra_admin_settings", JSON.stringify(cfg));
      toast({ title: "Settings saved", kind: "success" });
    } catch {
      toast({ title: "Save failed", kind: "error" });
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
          <Cog className="h-5 w-5 text-gold-500" />
          Settings
        </h1>
        <p className="text-sm text-muted mt-1">Site-wide configuration. Sandbox mode — persisted in localStorage.</p>
      </div>

      <div className="card p-6 space-y-6 max-w-2xl">
        <Section icon={Building2} title="Branding">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Site name</label>
              <input className="input" value={cfg.siteName} onChange={(e) => setCfg((c) => ({ ...c, siteName: e.target.value }))} />
            </div>
            <div>
              <label className="label">Tagline</label>
              <input className="input" value={cfg.siteTagline} onChange={(e) => setCfg((c) => ({ ...c, siteTagline: e.target.value }))} />
            </div>
          </div>
        </Section>

        <Section icon={Globe} title="Localization">
          <div>
            <label className="label">Default language</label>
            <select className="input max-w-xs" value={cfg.defaultLocale} onChange={(e) => setCfg((c) => ({ ...c, defaultLocale: e.target.value as "en" | "ar" }))}>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </Section>

        <Section icon={Bell} title="Features">
          <div className="space-y-3">
            <Toggle label="Inquiry form enabled" value={cfg.enableInquiries} onChange={(v) => setCfg((c) => ({ ...c, enableInquiries: v }))} />
            <Toggle label="Property Finder webhook ingest" value={cfg.enableLeadsWebhook} onChange={(v) => setCfg((c) => ({ ...c, enableLeadsWebhook: v }))} />
            <Toggle label="AI matching engine" value={cfg.enableAI} onChange={(v) => setCfg((c) => ({ ...c, enableAI: v }))} />
          </div>
        </Section>

        <Section icon={Shield} title="Operations">
          <Toggle label="Maintenance mode (takes site offline)" value={cfg.maintenanceMode} onChange={(v) => setCfg((c) => ({ ...c, maintenanceMode: v }))} danger />
        </Section>

        <div className="flex justify-end pt-4 border-t border-border">
          <button onClick={save} className="btn-gold">
            <Save className="h-4 w-4" /> Save settings
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gold-500" />
        <h3 className="font-serif text-base font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange, danger }: { label: string; value: boolean; onChange: (v: boolean) => void; danger?: boolean }) {
  return (
    <label className="flex items-center justify-between gap-4 py-2">
      <span className={`text-sm ${danger && value ? "text-red-600 font-semibold" : ""}`}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? (danger ? "bg-red-500" : "bg-gold-500") : "bg-navy-900/20"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
    </label>
  );
}
