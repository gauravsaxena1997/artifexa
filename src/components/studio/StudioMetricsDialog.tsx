"use client";

import { X, Copy, Check } from "lucide-react";
import { useState } from "react";

interface StudioMetricsDialogProps {
  runMeta: {
    totalCalls: number;
    totalTime: number;
    refinementLoops: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  onClose: () => void;
}

export function StudioMetricsDialog({ runMeta, onClose }: StudioMetricsDialogProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const tokenLimit = 50000;
  const usagePct = Math.min((runMeta.totalTokens / tokenLimit) * 100, 100);

  const handleCopy = (val: number, key: string) => {
    navigator.clipboard.writeText(val.toString());
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-slate-900 leading-none">Pipeline Metrics</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-1 font-bold uppercase tracking-wider">Session Diagnostic</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-all font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-sm group relative">
              <button 
                onClick={() => handleCopy(runMeta.promptTokens, "prompt")}
                className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition-all text-slate-400"
              >
                {copiedKey === "prompt" ? <Check className="w-3 h-3 text-indigo-500" /> : <Copy className="w-3 h-3" />}
              </button>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Input</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">{runMeta.promptTokens.toLocaleString()}</span>
                <span className="text-[9px] text-slate-400 font-mono font-bold">tkns</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-sm group relative">
              <button 
                onClick={() => handleCopy(runMeta.completionTokens, "completion")}
                className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition-all text-slate-400"
              >
                {copiedKey === "completion" ? <Check className="w-3 h-3 text-indigo-500" /> : <Copy className="w-3 h-3" />}
              </button>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Output</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">{runMeta.completionTokens.toLocaleString()}</span>
                <span className="text-[9px] text-slate-400 font-mono font-bold">tkns</span>
              </div>
            </div>
          </div>


          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Total Energy Usage</p>
              <span className="text-xs font-bold text-indigo-700">{runMeta.totalTokens.toLocaleString()} tkns</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200/50 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(99,102,241,0.3)] ${
                  runMeta.totalTokens > 40000 ? "bg-rose-500" : runMeta.totalTokens > 25000 ? "bg-amber-500" : "bg-indigo-500"
                }`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-400 mt-2 text-center font-medium">Session limit: 50,000 tokens</p>
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-100">
            <div className="text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Calls</p>
              <p className="text-sm font-bold text-slate-900">{runMeta.totalCalls}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Time</p>
              <p className="text-sm font-bold text-slate-900">{(runMeta.totalTime / 1000).toFixed(1)}s</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Loops</p>
              <p className="text-sm font-bold text-slate-900">{runMeta.refinementLoops}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
