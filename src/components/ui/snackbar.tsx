"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface SnackbarProps {
  open: boolean;
  message: string;
  tone?: "error" | "success";
  durationMs?: number;
  onClose: () => void;
}

export function Snackbar({
  open,
  message,
  tone = "error",
  durationMs = 5000,
  onClose,
}: SnackbarProps) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, onClose, open]);

  if (!open || !message) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "w-full max-w-lg rounded-xl border shadow-2xl px-5 py-4 flex items-center gap-4 transition-all duration-300",
          tone === "error"
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-emerald-600 border-emerald-500 text-white"
        )}
      >
        {tone === "error" ? (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
        )}
        <p className="text-sm font-medium leading-relaxed flex-1">{message}</p>
        <button
          className="text-slate-400 hover:text-white transition-colors p-1"
          onClick={onClose}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
