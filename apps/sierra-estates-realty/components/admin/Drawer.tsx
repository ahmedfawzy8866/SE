"use client";
/**
 * Drawer — right-side sliding panel for create/edit forms.
 */
import { X } from "lucide-react";
import { type ReactNode, useEffect } from "react";

export function Drawer({
  open, onClose, title, children, footer, width = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const w = width === "sm" ? "max-w-md" : width === "lg" ? "max-w-3xl" : "max-w-xl";

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${w} h-full bg-surface shadow-pop flex flex-col animate-in slide-in-from-right`}>
        <header className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-serif text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-text">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <footer className="p-4 border-t border-border flex items-center justify-end gap-2 bg-navy-900/5">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
