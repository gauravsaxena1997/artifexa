"use client";

import { CheckCircle2, Loader2, Circle, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Bot } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import type { AgentEvent, OrchestratorState } from "@/types";

interface ProcessViewProps {
  events: AgentEvent[];
  isRunning: boolean;
}

const STAGE_META: {
  state: OrchestratorState;
  label: string;
  coreAgent: string;
  persona: string;
  description: string;
  loadingMessage: string;
}[] = [
  {
    state: "NORMALIZING",
    label: "Understanding input",
    coreAgent: "System",
    persona: "Input Normalizer",
    description: "Sanitizing input, extracting context, adding guardrails",
    loadingMessage: "Reading your idea...",
  },
  {
    state: "PLANNING",
    label: "Planning product",
    coreAgent: "Planner",
    persona: "Product Manager + UX Thinker",
    description: "Building PRD with features, phases, and user journeys",
    loadingMessage: "Thinking about the product shape...",
  },
  {
    state: "EXECUTING_ARCHITECT",
    label: "Designing architecture",
    coreAgent: "Executor",
    persona: "Tech Architect + Backend Eng + DB Designer",
    description: "Designing tech stack, APIs, database schema, and system components",
    loadingMessage: "Designing the technical blueprint...",
  },
  {
    state: "EXECUTING_QA",
    label: "Generating test plan",
    coreAgent: "Executor",
    persona: "QA Strategist",
    description: "Writing test strategy, functional tests, edge cases, and security checks",
    loadingMessage: "Writing test scenarios...",
  },
  {
    state: "REVIEWING",
    label: "Quality review",
    coreAgent: "Critic",
    persona: "Senior Engineering Reviewer",
    description: "Scoring output quality, checking consistency, flagging issues",
    loadingMessage: "Running quality checks...",
  },
  {
    state: "REFINING",
    label: "Refining output",
    coreAgent: "System",
    persona: "Refinement Loop",
    description: "Re-running weakest section based on critic feedback",
    loadingMessage: "Improving based on feedback...",
  },
  {
    state: "FINALIZING",
    label: "Preparing documents",
    coreAgent: "Finalizer",
    persona: "Technical Writer",
    description: "Assembling final bundle with title and executive summary",
    loadingMessage: "Polishing the final documents...",
  },
];

function getStageStatus(state: OrchestratorState, events: AgentEvent[]) {
  const stageEvents = events.filter((e) => e.state === state);
  if (stageEvents.length === 0) return "pending";
  const hasCompleted = stageEvents.some((e) => e.type === "completed");
  const hasError = stageEvents.some((e) => e.type === "error");
  if (hasError) return "error";
  if (hasCompleted) return "completed";
  return "active";
}

function StageIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />;
  if (status === "active") return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
  if (status === "error") return <AlertCircle className="w-5 h-5 text-destructive" />;
  return <Circle className="w-5 h-5 text-muted-foreground/30" />;
}

export function ProcessView({ events, isRunning }: ProcessViewProps) {
  const [showThinking, setShowThinking] = useState(true);
  const [manualOverrides, setManualOverrides] = useState<Set<string>>(new Set());
  const prevActiveRef = useRef<string | null>(null);

  const hasRefine = events.some((e) => e.state === "REFINING");
  const stages = STAGE_META.filter((s) => s.state !== "REFINING" || hasRefine);

  const isEmpty = events.length === 0;

  // Find the currently active stage
  const activeStage = stages.find(
    (s) => getStageStatus(s.state, events) === "active"
  )?.state ?? null;

  // Auto-expand active stage when it changes
  useEffect(() => {
    if (activeStage && activeStage !== prevActiveRef.current) {
      prevActiveRef.current = activeStage;
      // Clear manual overrides when a new stage becomes active
      setManualOverrides(new Set());
    }
  }, [activeStage]);

  const isStageExpanded = (state: string, status: string) => {
    // Manual override takes priority
    if (manualOverrides.has(state)) {
      return true;
    }
    // Auto-expand: active stage is expanded, everything else collapsed
    if (status === "active") return true;
    return false;
  };

  const toggleStage = (state: string) => {
    setManualOverrides((prev) => {
      const next = new Set(prev);
      if (next.has(state)) {
        next.delete(state);
      } else {
        next.add(state);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="text-base font-semibold">Process</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Details</span>
          <Switch checked={showThinking} onCheckedChange={setShowThinking} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isEmpty && !isRunning ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="space-y-4">
              {STAGE_META.filter((s) => s.state !== "REFINING").map((stage) => (
                <div
                  key={stage.state}
                  className="flex items-center gap-3 text-muted-foreground/40"
                >
                  <Circle className="w-5 h-5" />
                  <div className="text-left">
                    <span className="text-sm">{stage.label}</span>
                    <span className="text-xs ml-2 opacity-60">{stage.coreAgent} → {stage.persona}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground/50 mt-8">
              Stages will appear here when you run the pipeline
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stages.map((stage) => {
              const status = getStageStatus(stage.state, events);
              const stageEvents = events.filter((e) => e.state === stage.state);
              const latestEvent = stageEvents[stageEvents.length - 1];
              const expanded = isStageExpanded(stage.state, status);
              const isLoop = stage.state === "REFINING";

              if (status === "pending") return null;

              return (
                <div
                  key={stage.state}
                  className={`rounded-xl border p-4 transition-all animate-fade-in-up ${
                    status === "active"
                      ? "border-primary/40 bg-primary/5 shadow-sm"
                      : status === "completed"
                        ? "border-[var(--success)]/20 bg-[var(--success)]/5"
                        : status === "error"
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-border/50"
                  }`}
                >
                  <button
                    className="flex items-center justify-between w-full text-left"
                    onClick={() => toggleStage(stage.state)}
                  >
                    <div className="flex items-center gap-3">
                      <StageIcon status={status} />
                      <div>
                        <span className="text-sm font-medium">
                          {isLoop && <RefreshCw className="w-3.5 h-3.5 inline mr-1.5" />}
                          {stage.label}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Bot className="w-3 h-3 text-primary/60" />
                          <span className="text-xs text-primary/60">{stage.coreAgent} → {stage.persona}</span>
                        </div>
                      </div>
                    </div>
                    {stageEvents.length > 0 && (
                      expanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )
                    )}
                  </button>

                  {status === "active" && stageEvents.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2 pl-8 italic animate-pulse">
                      {stage.loadingMessage}
                    </p>
                  )}

                  {latestEvent && !expanded && (
                    <p className="text-sm text-muted-foreground mt-2 pl-8 line-clamp-2">
                      {latestEvent.message}
                    </p>
                  )}

                  {expanded && showThinking && stageEvents.length > 0 && (
                    <div className="mt-3 pl-8 space-y-2 border-l-2 border-primary/10 ml-2.5">
                      <p className="text-xs text-muted-foreground/70 italic pl-3">
                        {stage.description}
                      </p>
                      {stageEvents.map((evt) => (
                        <div key={evt.id} className="text-sm pl-3">
                          {evt.persona && (
                            <span className="text-primary/70 font-medium mr-1.5 text-xs">
                              [{evt.persona}]
                            </span>
                          )}
                          <span className="text-muted-foreground">{evt.message}</span>
                          {evt.detail && (
                            <p className="text-muted-foreground/60 mt-0.5 text-xs italic">{evt.detail}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {events.some((e) => e.state === "DONE") && (
              <div className="rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/5 p-4 animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                  <span className="text-sm font-semibold text-[var(--success)]">
                    All Done
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 pl-8">
                  {events.find((e) => e.state === "DONE")?.message}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
