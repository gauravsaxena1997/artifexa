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
          "w-full max-w-lg rounded-lg border shadow-lg backdrop-blur-sm px-4 py-3 flex items-start gap-3",
          tone === "error"
            ? "bg-destructive/10 border-destructive/40 text-foreground"
            : "bg-[var(--success)]/10 border-[var(--success)]/40 text-foreground"
        )}
      >
        {tone === "error" ? (
          <AlertCircle className="w-4 h-4 mt-0.5 text-destructive shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 mt-0.5 text-[var(--success)] shrink-0" />
        )}
        <p className="text-sm leading-5 flex-1">{message}</p>
        <button
          className="text-muted-foreground hover:text-foreground transition-colors"
          onClick={onClose}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
