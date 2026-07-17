"use client";
/**
 * AdminSignIn — gate shown when the user lands on /admin without a session.
 */
import { useEffect, useState } from "react";
import { Shield, Loader2, Mail, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/client/AuthModal";
import { useToast } from "@/components/client/Toast";
import { api } from "@/lib/api-client";
import { isFirebaseClientConfigured as firebaseEnabled, auth } from "@/lib/firebase";
import { DEMO_ADMIN } from "@/lib/auth";

export function AdminSignIn() {
  const { refresh } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // If a session appears (e.g. user signs in elsewhere), parent re-renders.
  useEffect(() => { refresh(); }, [refresh]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (firebaseEnabled) {
        if (!auth) throw new Error("Firebase not initialized");
        const { signInWithEmailAndPassword, getIdToken } = await import("firebase/auth");
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const token = await getIdToken(cred.user);
        await fetch("/api/auth", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "signin", email, token }),
        });
      } else {
        await api.signIn(email, password);
      }
      await refresh();
      toast({ title: "Welcome", kind: "success" });
    } catch (err: any) {
      toast({ title: "Sign-in failed", description: err.message, kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-7">
        <Link
          href={process.env.NEXT_PUBLIC_CLIENT_URL || "/"}
          className="inline-flex items-center gap-1 text-xs text-muted hover:text-text mb-4"
        >
          <ArrowLeft className="h-3 w-3" /> Back to site
        </Link>
        <div className="text-center mb-6">
          <div className="mx-auto h-14 w-14 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 mb-3">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="font-serif text-2xl font-bold">Admin Console</h1>
          <p className="text-sm text-muted mt-1">Staff access only. All actions are logged.</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-9" placeholder="you@sierra-estates.net" />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-9" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-gold w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        {!firebaseEnabled && (
          <div className="mt-4 p-3 rounded-md bg-gold-300/10 border border-gold-300/30 text-xs text-gold-600">
            <p className="font-semibold mb-1">Demo mode (Firebase not configured)</p>
            <p>Use <code className="font-mono">{DEMO_ADMIN.email}</code> / <code className="font-mono">{DEMO_ADMIN.password}</code></p>
          </div>
        )}
      </div>
    </div>
  );
}
