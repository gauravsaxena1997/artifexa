"use client";

import { Activity } from "lucide-react";

interface PipelineStatusBadgeProps {
  isRunning: boolean;
  eventCount: number;
  onClick: () => void;
}

export function PipelineStatusBadge({ isRunning, eventCount, onClick }: PipelineStatusBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-40 rounded-full border shadow-xl px-5 py-3 flex items-center gap-3 transition-all duration-300 hover:scale-105 ${
        isRunning 
          ? "bg-slate-900 border-slate-800 shadow-indigo-500/20 group" 
          : "bg-white border-slate-200 text-slate-700 hover:border-indigo-200"
      }`}
    >
      <Activity className={`w-4 h-4 ${isRunning ? "text-indigo-400 group-hover:text-indigo-300 animate-pulse" : "text-slate-400"}`} />
      <span className={`text-sm font-semibold tracking-wide ${isRunning ? "text-white" : "text-slate-700"}`}>
        {isRunning ? "Orchestrating" : "Pipeline Status"}
      </span>
      {eventCount > 0 && (
        <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 ${isRunning ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-100 text-slate-500"}`}>
          {eventCount}
        </span>
      )}
    </button>
  );
}
