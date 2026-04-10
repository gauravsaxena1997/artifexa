"use client";

import { X } from "lucide-react";
import type { AgentInfo } from "@/types/creative";

interface AgentInfoDialogProps {
  title?: string;
  description: string;
  agents: AgentInfo[];
  onClose: () => void;
}

export function AgentInfoDialog({
  title = "AI Agent Matrix",
  description,
  agents,
  onClose,
}: AgentInfoDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md" onClick={onClose}>
      <div
        className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full p-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed font-light">
          {description}
        </p>
        <div className="space-y-3">
          {agents.map((agent, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border shadow-sm ${
                agent.conditional
                  ? "border-dashed border-indigo-200 bg-indigo-50/50"
                  : "border-slate-100 bg-slate-50/80"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-900">{agent.coreAgent}</span>
                    <span className="text-slate-300">&#8594;</span>
                    <span className="text-indigo-600 text-xs font-bold tracking-wide uppercase">{agent.persona}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-light">{agent.role}</p>
                </div>
                {agent.conditional && agent.condition && (
                  <span className="text-[9px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full shrink-0 font-bold uppercase tracking-wider">
                    {agent.condition}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
