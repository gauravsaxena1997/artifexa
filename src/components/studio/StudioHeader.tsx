"use client";

import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface StudioHeaderProps {
  /** Studio display name */
  name: string;
  /** Icon element to render (e.g., <Palette />, <Package />) */
  icon: ReactNode;
  /** Pipeline flow subtitle text */
  pipelineFlow: string;
  /** Callback to open agent info dialog */
  onShowAgentInfo: () => void;
  /** Run metadata to display in the header (optional) */
  runMeta?: {
    totalCalls: number;
    totalTime: number;
    totalTokens: number;
    refinementLoops: number;
  } | null;
}

export function StudioHeader({
  name,
  icon,
  pipelineFlow,
  onShowAgentInfo,
  runMeta,
}: StudioHeaderProps) {
  return (
    <header className="shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-md z-40 relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-200 to-transparent opacity-50" />
      <div className="flex items-center justify-between px-5 h-14">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="w-px h-5 bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">{name}</h1>
                <button
                  onClick={onShowAgentInfo}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                  title="View AI agents pipeline"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium tracking-wide">
                {pipelineFlow}
              </p>
            </div>
          </div>
        </div>
        {runMeta && (
          <div className="hidden sm:flex items-center gap-5 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {runMeta.totalCalls} Calls</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {(runMeta.totalTime / 1000).toFixed(1)}s</span>
            {runMeta.totalTokens > 0 && (
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-300" /> {runMeta.totalTokens.toLocaleString()} tkns</span>
            )}
            {runMeta.refinementLoops > 0 && (
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-300" /> {runMeta.refinementLoops} refinement{runMeta.refinementLoops > 1 ? "s" : ""}</span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
