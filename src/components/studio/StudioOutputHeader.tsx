"use client";

import { Info, Maximize2, Minimize2 } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface StudioOutputHeaderProps {
  title?: string;
  totalTokens?: number;
  onShowMetrics?: () => void;
  actions?: ReactNode;
  isFullscreen: boolean;
  onToggleFullscreen?: () => void;
  className?: string;
}

export function StudioOutputHeader({
  title = "Artifact Canvas",
  totalTokens,
  onShowMetrics,
  actions,
  isFullscreen,
  onToggleFullscreen,
  className = "",
}: StudioOutputHeaderProps) {
  return (
    <div className={`shrink-0 flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 ${className}`}>
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
        {totalTokens !== undefined && (
          <button
            onClick={onShowMetrics}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-white transition-all shadow-sm"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{totalTokens.toLocaleString()} tokens</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1.5 mr-1.5 pr-3 border-r border-slate-100">
           {actions}
        </div>
        
        {onToggleFullscreen && (
          <Button
            variant="outline"
            size="sm"
            className="w-9 h-9 p-0 rounded-xl bg-slate-100 border-slate-200 text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
