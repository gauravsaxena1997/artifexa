"use client";

import { CheckCircle2, Loader2, Circle, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Bot, Activity, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { DialogClose } from "@/components/ui/dialog";

export interface StudioEvent {
  id: string;
  timestamp: number;
  state: string;
  agent: string;
  persona?: string;
  type: "started" | "thinking" | "completed" | "error" | "loop";
  message: string;
  detail?: string;
}

export interface StudioStage {
  state: string;
  label: string;
  coreAgent: string;
  persona: string;
  description: string;
  loadingMessage: string;
  conditional: boolean;
}

interface ProcessMonitorProps {
  events: StudioEvent[];
  isRunning: boolean;
  runMeta: {
    totalCalls: number;
    totalTime: number;
    refinementLoops: number;
    qualityScore: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
  stages: StudioStage[];
}

function getStageStatus(state: string, events: StudioEvent[]) {
  const stageEvents = events.filter((e) => e.state === state);
  if (stageEvents.length === 0) return "pending";
  const hasCompleted = stageEvents.some((e) => e.type === "completed");
  const hasError = stageEvents.some((e) => e.type === "error");
  if (hasError) return "error";
  if (hasCompleted) return "completed";
  return "active";
}

function StageIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  if (status === "active") return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
  if (status === "error") return <AlertCircle className="w-5 h-5 text-destructive" />;
  return <Circle className="w-5 h-5 text-muted-foreground/30" />;
}

export function ProcessMonitor({ events, isRunning, runMeta, stages: stageMeta }: ProcessMonitorProps) {
  const [manualOverrides, setManualOverrides] = useState<Set<string>>(new Set());
  const prevActiveRef = useRef<string | null>(null);

  const hasRefine = events.some((e) => e.state === "REFINING");
  const stages = stageMeta.filter((s) => {
    if (s.state === "REFINING") return hasRefine;
    if (s.conditional) {
      return events.some((e) => e.state === s.state);
    }
    return true;
  }).reverse();

  const isEmpty = events.length === 0;

  const activeStageIndex = stages.findIndex(
    (s) => getStageStatus(s.state, events) === "active"
  );
  const activeStage = activeStageIndex !== -1 ? stages[activeStageIndex].state : null;
  const [progressPercent, setProgressPercent] = useState(0);
  const completedStages = stages.filter(s => getStageStatus(s.state, events) === "completed").length;

  useEffect(() => {
    const isDone = events.some((e) => e.state === "DONE");
    if (isDone) {
      setTimeout(() => setProgressPercent(100), 0);
      return;
    }
    const activeCount = stages.filter(s => getStageStatus(s.state, events) === "active").length;
    const rawProgress = stages.length > 0 ? ((completedStages + (activeCount * 0.5)) / stages.length) * 100 : 0;
    setTimeout(() => setProgressPercent((prev) => Math.max(prev, rawProgress)), 0);
  }, [events, stages.length, completedStages, stages]);

  useEffect(() => {
    if (activeStage && activeStage !== prevActiveRef.current) {
      prevActiveRef.current = activeStage;
      setTimeout(() => setManualOverrides(new Set()), 0);
    }
  }, [activeStage]);

  const isStageExpanded = (state: string, status: string) => {
    if (manualOverrides.has(`${state}_collapsed`)) return false;
    if (manualOverrides.has(`${state}_expanded`)) return true;
    if (status === "active") return true;
    if (status === "completed") return true;
    return false;
  };

  const toggleStage = (state: string) => {
    const status = getStageStatus(state, events);
    const currentlyExpanded = isStageExpanded(state, status);

    setManualOverrides((prev) => {
      const next = new Set(prev);
      if (currentlyExpanded) {
        next.add(`${state}_collapsed`);
        next.delete(`${state}_expanded`);
      } else {
        next.add(`${state}_expanded`);
        next.delete(`${state}_collapsed`);
      }
      return next;
    });
  };

  const isAllExpanded = stages.length > 0 && stages.every((s) => 
    isStageExpanded(s.state, getStageStatus(s.state, events))
  );

  const toggleAll = () => {
    const nextOverrides = new Set<string>();
    if (isAllExpanded) {
      stages.forEach(s => nextOverrides.add(`${s.state}_collapsed`));
    } else {
      stages.forEach(s => nextOverrides.add(`${s.state}_expanded`));
    }
    setManualOverrides(nextOverrides);
  };

  const cleanText = (text: string | undefined) => {
    if (!text) return "";
    return text.replace(/—/g, ": ").replace(/--/g, "-");
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-900">
      {/* Enhanced Dashboard Header */}
      <div className="shrink-0 px-8 py-6 border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
                Pipeline Monitor
              </h2>
              <p className="text-[10px] text-slate-400 mt-1.5 font-mono uppercase tracking-[0.2em] font-bold">
                Orchestration Engine v1.0
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={toggleAll}
                disabled={isRunning}
                className="px-4 py-2 max-h-10 text-[11px] font-bold uppercase tracking-wider rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-all flex items-center justify-center min-w-[120px]"
              >
                {isRunning ? (isAllExpanded ? "Collapse All" : "Expand All") : (isAllExpanded ? "Collapse All" : "Expand All")}
              </button>
              <DialogClose render={
                <button className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 transition-all flex items-center justify-center shadow-sm border border-slate-200/60">
                  <X className="w-4 h-4" />
                </button>
              }>
              </DialogClose>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div className="text-[11px] font-medium">
                {isRunning ? (
                  <span className="flex items-center gap-2 text-slate-600">
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                    Processing: <span className="text-slate-900 font-bold">{cleanText(stages[activeStageIndex]?.label) || "Initializing"}</span>
                  </span>
                ) : (
                  <span className="text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Analysis Complete
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono font-bold">{completedStages}/{stages.length} Stages</div>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.2)]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-6 bg-slate-50/30">
        {isEmpty && !isRunning ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-8 shadow-inner">
              <Activity className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-slate-900 font-bold mb-2">Ready for Orchestration</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Start the pipeline to see specialist agents collaborate on your vision.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto pb-10">
            {stages.map((stage, i) => {
              const status = getStageStatus(stage.state, events);
              const stageEvents = events.filter((e) => e.state === stage.state);
              const expanded = isStageExpanded(stage.state, status);
              const isLoop = stage.state === "REFINING";
              const stepNumber = stages.length - i;

              if (status === "pending") return null;

              return (
                <motion.div
                  layout
                  key={stage.state}
                  className={`rounded-2xl border transition-all duration-300 ${
                    status === "active"
                      ? "border-primary bg-white shadow-xl shadow-primary/5"
                      : status === "completed"
                        ? "border-slate-200 bg-white"
                        : status === "error"
                          ? "border-rose-200 bg-rose-50/30"
                          : "border-slate-100 bg-white/50"
                  }`}
                >
                  <button
                    className="flex items-center justify-between w-full text-left p-5 disabled:cursor-default"
                    onClick={() => toggleStage(stage.state)}
                    disabled={isRunning}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`shrink-0 transition-transform duration-300 ${status === "active" ? "scale-110" : "scale-100"}`}>
                        <StageIcon status={status} />
                      </div>
                      <div>
                        <span className={`text-sm font-bold tracking-tight flex items-center ${status === "active" ? "text-slate-900" : "text-slate-700"}`}>
                          <span className="text-[10px] text-slate-400 font-mono font-bold mr-2 uppercase tracking-wider">Step {stepNumber}</span>
                          {isLoop && <RefreshCw className="w-3.5 h-3.5 inline mr-2 text-indigo-500" />}
                          {cleanText(stage.label)}
                          {stage.conditional && (
                            <span className="ml-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Specialist</span>
                          )}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Bot className={`w-3 h-3 ${status === "active" ? "text-primary" : "text-slate-400"}`} />
                          <span className="text-[11px] font-medium text-slate-400">
                             {stage.coreAgent} <span className="mx-1 opacity-30">/</span> {stage.persona}
                          </span>
                        </div>
                      </div>
                    </div>
                    {stageEvents.length > 0 && (
                      <div className={`p-1.5 rounded-lg transition-colors ${expanded ? "bg-slate-100 text-slate-900" : "bg-transparent text-slate-300"}`}>
                        {expanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    )}
                  </button>

                  <motion.div
                    animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-0">
                      <div className="space-y-4">
                        <div className="bg-slate-50/50 rounded-xl p-3">
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                            {cleanText(stage.description)}
                          </p>
                        </div>
                        
                        <div className="space-y-4 pt-1">
                          {stageEvents.map((evt) => (
                            <div key={evt.id} className="text-sm">
                              {evt.persona && (
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  {evt.persona}
                                </div>
                              )}
                              <div className="text-slate-600 leading-relaxed font-medium">
                                {cleanText(evt.message)}
                              </div>
                              {evt.detail && (
                                <div className="mt-1.5 text-[11px] text-slate-500 leading-relaxed max-w-2xl">
                                  {cleanText(evt.detail)}
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {status === "active" && stageEvents.length === 0 && (
                            <div className="flex items-center gap-3 py-2">
                              <Loader2 className="w-3 h-3 animate-spin text-primary" />
                              <p className="text-xs text-slate-400 italic">
                                {cleanText(stage.loadingMessage)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}

            {events.some((e) => e.state === "DONE") && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl border-2 border-emerald-100 bg-white p-8 text-center shadow-xl shadow-emerald-500/5"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Orchestration Complete</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  {cleanText(events.find((e) => e.state === "DONE")?.message)}
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="shrink-0 px-8 py-3.5 border-t border-slate-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)] flex items-center justify-center text-xs text-slate-500 font-medium tracking-wide">
        <span>Total Time: <span className="text-slate-900 font-bold ml-1">{runMeta ? (runMeta.totalTime / 1000).toFixed(2) : "0.00"}s</span></span>
        <span className="mx-5 text-slate-200 text-[10px]">|</span>
        <span>LLM Calls: <span className="text-indigo-600 font-bold ml-1">{runMeta?.totalCalls ?? 0}</span></span>
        <span className="mx-5 text-slate-200 text-[10px]">|</span>
        <span>Tokens: <span className="text-purple-600 font-bold ml-1">{runMeta?.totalTokens?.toLocaleString() ?? "0"}</span></span>
      </div>
    </div>
  );
}
