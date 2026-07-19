/**
 * OpenClaw Terminal — Sierra Estates Admin
 * ─────────────────────────────────────────
 * An AI architect terminal embedded in the admin dashboard.
 * Users describe code changes in natural language; OpenClaw
 * proposes a diff for approval before executing anything.
 *
 * Architecture:
 *  - Client component (needs useState, useEffect, useRef)
 *  - Calls /api/openclaw (streaming) for AI responses
 *  - Three panel modes: chat / diff / history
 *  - No deployment without explicit user approval
 */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Terminal, Send, Loader2, CheckCircle2, XCircle,
  RotateCcw, Clock, ChevronRight, Sparkles, Code2,
  GitBranch, Zap, AlertTriangle, Copy, Check,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type MessageRole = "user" | "assistant" | "system";
type MessageStatus = "pending" | "streaming" | "done" | "error";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  timestamp: Date;
  diff?: string;        // proposed code diff (if any)
  approved?: boolean;   // undefined = pending, true/false = decided
}

interface HistoryEntry {
  id: string;
  prompt: string;
  result: "approved" | "rejected" | "pending";
  timestamp: Date;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ─── Suggested prompts ──────────────────────────────────────────────────── */

const SUGGESTIONS = [
  "Add a mortgage calculator below the listings grid",
  "Change the hero background to a cinematic dusk shot",
  "Add a WhatsApp floating CTA button on mobile",
  "Lazy-load all images below the fold",
  "Add dark-mode toggle to the nav",
  "Create a compound comparison page (side-by-side)",
];

/* ─── Diff viewer ────────────────────────────────────────────────────────── */

function DiffViewer({ diff }: { diff: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(diff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = diff.split("\n");

  return (
    <div className="relative rounded-xl overflow-hidden border border-[var(--bd-s)] bg-[var(--bg)] mt-3">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--bd)] bg-[var(--surf)]">
        <span className="flex items-center gap-2 text-[11px] font-mono text-[var(--tx-m)]">
          <Code2 className="h-3 w-3" /> Proposed diff
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[11px] text-[var(--tx-m)] hover:text-[var(--gold)] transition-colors"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-3 text-[11px] font-mono leading-5 overflow-x-auto max-h-64 overflow-y-auto">
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.startsWith("+")
                ? "text-emerald-400 bg-emerald-950/30"
                : line.startsWith("-")
                ? "text-red-400 bg-red-950/30"
                : line.startsWith("@@")
                ? "text-blue-400"
                : "text-[var(--tx-m)]"
            }
          >
            {line || "\u00a0"}
          </div>
        ))}
      </pre>
    </div>
  );
}

/* ─── Approval buttons ───────────────────────────────────────────────────── */

function ApprovalBar({
  onApprove,
  onReject,
  decided,
}: {
  onApprove: () => void;
  onReject: () => void;
  decided?: boolean;
}) {
  if (decided !== undefined) {
    return (
      <div className={`flex items-center gap-2 mt-3 text-[12px] font-medium ${decided ? "text-emerald-400" : "text-red-400"}`}>
        {decided ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        Change {decided ? "approved & applied" : "rejected"}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-3">
      <button
        onClick={onApprove}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-emerald-500 text-white hover:bg-emerald-400 transition-colors"
      >
        <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Apply
      </button>
      <button
        onClick={onReject}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[var(--surf)] text-[var(--tx-m)] hover:text-red-400 hover:bg-red-950/20 border border-[var(--bd)] transition-colors"
      >
        <XCircle className="h-3.5 w-3.5" /> Reject
      </button>
    </div>
  );
}

/* ─── Chat bubble ────────────────────────────────────────────────────────── */

function ChatBubble({
  msg,
  onApprove,
  onReject,
}: {
  msg: Message;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <span className="text-[10px] font-mono text-[var(--tx-f)] bg-[var(--surf)] px-3 py-1 rounded-full border border-[var(--bd)]">
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} mb-4`}>
      {/* Avatar */}
      <div
        className={`h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-bold ${
          isUser
            ? "bg-[var(--gold)] text-[#0A1628]"
            : "bg-gradient-to-br from-violet-600 to-blue-600 text-white"
        }`}
      >
        {isUser ? "A" : "✦"}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
            isUser
              ? "bg-[var(--gold)] text-[#0A1628] rounded-tr-sm font-medium"
              : "bg-[var(--surf)] border border-[var(--bd)] text-[var(--tx)] rounded-tl-sm"
          }`}
        >
          {msg.status === "streaming" && msg.content === "" ? (
            <span className="flex items-center gap-2 text-[var(--tx-m)]">
              <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
            </span>
          ) : (
            <span className="whitespace-pre-wrap">{msg.content}</span>
          )}
        </div>

        {/* Proposed diff */}
        {msg.diff && <DiffViewer diff={msg.diff} />}

        {/* Approval bar for assistant messages with diff */}
        {msg.diff && !isUser && (
          <ApprovalBar
            onApprove={() => onApprove(msg.id)}
            onReject={() => onReject(msg.id)}
            decided={msg.approved}
          />
        )}

        <span className="text-[10px] text-[var(--tx-f)] px-1">{fmtTime(msg.timestamp)}</span>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */

export function OpenClawTerminal() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "system",
      content: "OpenClaw v1.0 · Sierra Estates AI Architect",
      status: "done",
      timestamp: new Date(),
    },
    {
      id: uid(),
      role: "assistant",
      content:
        "Hello. I'm OpenClaw — Sierra's AI architect.\n\nDescribe any change you want to make to the codebase in plain language. I'll analyse the existing patterns, propose a diff, and only apply it after you approve.\n\nI never push to GitHub or deploy without your explicit permission.",
      status: "done",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Auto-resize textarea */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input]);

  /* ── Approve / Reject a proposed change ─────────────────────────────── */
  const handleApprove = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, approved: true } : m))
    );
    setHistory((prev) => [
      {
        id: uid(),
        prompt: prev[0]?.prompt ?? "Unknown change",
        result: "approved",
        timestamp: new Date(),
      },
      ...prev,
    ]);
    // Add a system confirmation message
    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: "system",
        content: "✓ Change approved — queued for application",
        status: "done",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleReject = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, approved: false } : m))
    );
    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: "system",
        content: "✗ Change rejected — no files modified",
        status: "done",
        timestamp: new Date(),
      },
    ]);
  }, []);

  /* ── Send message ────────────────────────────────────────────────────── */
  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: text.trim(),
      status: "done",
      timestamp: new Date(),
    };

    const assistantId = uid();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      status: "streaming",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/openclaw-terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text.trim() }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: data.reply ?? "Done.",
                diff: data.diff ?? undefined,
                status: "done",
              }
            : m
        )
      );

      // Log to history
      setHistory((prev) => [
        {
          id: uid(),
          prompt: text.trim(),
          result: data.diff ? "pending" : "approved",
          timestamp: new Date(),
        },
        ...prev.slice(0, 49),
      ]);
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: `Error: ${err.message ?? "Request failed"}. Check that /api/openclaw is configured.`,
                status: "error",
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleSuggestion = (s: string) => {
    setInput(s);
    textareaRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([
      {
        id: uid(),
        role: "system",
        content: "Chat cleared · OpenClaw v1.0",
        status: "done",
        timestamp: new Date(),
      },
      {
        id: uid(),
        role: "assistant",
        content: "Ready. What would you like to change?",
        status: "done",
        timestamp: new Date(),
      },
    ]);
  };

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[500px]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-900/30">
            <Terminal className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--tx)] flex items-center gap-2">
              OpenClaw
              <span className="text-[10px] font-mono font-normal bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30">
                v1.0
              </span>
            </h2>
            <p className="text-[11px] text-[var(--tx-f)]">AI Architect · Sierra Estates</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-[var(--surf)] border border-[var(--bd)] rounded-lg p-0.5">
            {(["chat", "history"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${
                  view === v
                    ? "bg-[var(--gold)] text-[#0A1628]"
                    : "text-[var(--tx-m)] hover:text-[var(--tx)]"
                }`}
              >
                {v === "chat" ? (
                  <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3" />Chat</span>
                ) : (
                  <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />History</span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={clearChat}
            title="Clear chat"
            className="p-1.5 rounded-lg text-[var(--tx-f)] hover:text-[var(--tx)] hover:bg-[var(--surf)] transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Capabilities strip ── */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0 overflow-x-auto pb-1">
        {[
          { icon: Code2, label: "Edit code", color: "text-blue-400" },
          { icon: GitBranch, label: "Propose diff", color: "text-emerald-400" },
          { icon: Zap, label: "Add feature", color: "text-amber-400" },
          { icon: AlertTriangle, label: "Fix bugs", color: "text-red-400" },
        ].map(({ icon: Icon, label, color }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 text-[11px] text-[var(--tx-m)] bg-[var(--surf)] border border-[var(--bd)] px-2.5 py-1 rounded-lg whitespace-nowrap flex-shrink-0"
          >
            <Icon className={`h-3 w-3 ${color}`} />
            {label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--tx-f)] bg-transparent px-2.5 py-1 rounded-lg whitespace-nowrap flex-shrink-0 border border-dashed border-[var(--bd)]">
          <XCircle className="h-3 w-3 text-red-400" />
          Never deploys without approval
        </div>
      </div>

      {view === "history" ? (
        /* ── History panel ── */
        <div className="flex-1 overflow-y-auto rounded-2xl border border-[var(--bd)] bg-[var(--surf)] p-4 space-y-2">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--tx-f)]">
              <Clock className="h-8 w-8 opacity-40" />
              <p className="text-sm">No history yet. Send your first prompt.</p>
            </div>
          ) : (
            history.map((h) => (
              <div
                key={h.id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl border border-[var(--bd)] bg-[var(--bg)] hover:border-[var(--bd-s)] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[var(--tx)] truncate">{h.prompt}</p>
                  <p className="text-[10px] text-[var(--tx-f)] mt-0.5">{fmtTime(h.timestamp)}</p>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    h.result === "approved"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : h.result === "rejected"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {h.result}
                </span>
              </div>
            ))
          )}
        </div>
      ) : (
        /* ── Chat panel ── */
        <>
          <div className="flex-1 overflow-y-auto rounded-2xl border border-[var(--bd)] bg-[var(--bg)] p-4 mb-3">
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                msg={msg}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* ── Suggestions ── */}
          {messages.length <= 3 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 flex-shrink-0">
              {SUGGESTIONS.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] text-[var(--tx-m)] bg-[var(--surf)] border border-[var(--bd)] hover:border-[var(--gold)]/50 hover:text-[var(--gold)] transition-colors whitespace-nowrap flex-shrink-0"
                >
                  <ChevronRight className="h-3 w-3 flex-shrink-0" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* ── Input ── */}
          <div className="flex-shrink-0 flex items-end gap-2 bg-[var(--surf)] border border-[var(--bd)] rounded-2xl px-3 py-2 focus-within:border-[var(--gold)]/50 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Describe a change… e.g. "Add a dark mode toggle to the nav"'
              rows={1}
              disabled={loading}
              className="flex-1 bg-transparent resize-none text-[13px] text-[var(--tx)] placeholder:text-[var(--tx-f)] outline-none leading-relaxed max-h-[120px] disabled:opacity-50"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="h-8 w-8 rounded-xl bg-[var(--gold)] text-[#0A1628] flex items-center justify-center flex-shrink-0 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all mb-0.5"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-[var(--tx-f)] text-center mt-1.5 flex-shrink-0">
            Enter to send · Shift+Enter for new line · Changes require your approval
          </p>
        </>
      )}
    </div>
  );
}
