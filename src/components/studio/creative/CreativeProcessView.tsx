"use client";

import { CheckCircle2, Loader2, Circle, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Bot } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { CreativeAgentEvent, CreativeOrchestratorState } from "@/types/creative";

interface CreativeProcessViewProps {
  events: CreativeAgentEvent[];
  isRunning: boolean;
}

const STAGE_META: {
  state: CreativeOrchestratorState;
  label: string;
  coreAgent: string;
  persona: string;
  description: string;
  loadingMessage: string;
  conditional: boolean;
}[] = [
  {
    state: "ANALYZING",
    label: "Analyzing input",
    coreAgent: "System",
    persona: "Input Analyzer",
    description: "Detecting medium, style, subject type, and determining which specialist agents to activate",
    loadingMessage: "Understanding your creative request...",
    conditional: false,
  },
  {
    state: "DIRECTING",
    label: "Creative direction",
    coreAgent: "Planner",
    persona: "Creative Director",
    description: "Defining creative vision, filling all missing details, composition, color palette, and mood",
    loadingMessage: "Shaping the creative vision...",
    conditional: false,
  },
  {
    state: "PHOTOGRAPHING",
    label: "Photography specs",
    coreAgent: "Executor",
    persona: "Photographer",
    description: "Setting camera, lens, lighting setup, and post-processing details",
    loadingMessage: "Setting up the perfect shot...",
    conditional: true,
  },
  {
    state: "CINEMATOGRAPHING",
    label: "Cinematography specs",
    coreAgent: "Executor",
    persona: "Cinematographer",
    description: "Planning camera movement, shot type, angle, and visual flow",
    loadingMessage: "Choreographing the camera movement...",
    conditional: true,
  },
  {
    state: "POSE_DIRECTING",
    label: "Pose & wardrobe",
    coreAgent: "Executor",
    persona: "Pose Director",
    description: "Specifying pose, wardrobe, hair, accessories, expression, and body language",
    loadingMessage: "Directing the pose and wardrobe...",
    conditional: true,
  },
  {
    state: "ART_DIRECTING",
    label: "Art direction",
    coreAgent: "Executor",
    persona: "Art Director",
    description: "Defining art style, technique, texture, and visual references",
    loadingMessage: "Crafting the artistic style...",
    conditional: true,
  },
  {
    state: "REVIEWING",
    label: "Quality review",
    coreAgent: "Critic",
    persona: "Prompt Quality Reviewer",
    description: "Checking for vagueness, completeness, and platform compatibility",
    loadingMessage: "Reviewing prompt specificity...",
    conditional: false,
  },
  {
    state: "REFINING",
    label: "Refining output",
    coreAgent: "System",
    persona: "Refinement Loop",
    description: "Re-running weakest section based on critic feedback",
    loadingMessage: "Improving based on feedback...",
    conditional: true,
  },
  {
    state: "ASSEMBLING",
    label: "Assembling prompts",
    coreAgent: "Finalizer",
    persona: "Prompt Assembler",
    description: "Producing JSON structured prompt and natural language prompt for Gemini",
    loadingMessage: "Assembling the final prompts...",
    conditional: false,
  },
];

function getStageStatus(state: CreativeOrchestratorState, events: CreativeAgentEvent[]) {
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

export function CreativeProcessView({ events, isRunning }: CreativeProcessViewProps) {
  const [manualOverrides, setManualOverrides] = useState<Set<string>>(new Set());
  const prevActiveRef = useRef<string | null>(null);

  const hasRefine = events.some((e) => e.state === "REFINING");
  const stages = STAGE_META.filter((s) => {
    if (s.state === "REFINING") return hasRefine;
    if (s.conditional) {
      return events.some((e) => e.state === s.state);
    }
    return true;
  });

  const isEmpty = events.length === 0;

  const activeStage = stages.find(
    (s) => getStageStatus(s.state, events) === "active"
  )?.state ?? null;

  useEffect(() => {
    if (activeStage && activeStage !== prevActiveRef.current) {
      prevActiveRef.current = activeStage;
      setManualOverrides(new Set());
    }
  }, [activeStage]);

  const isStageExpanded = (state: string, status: string) => {
    if (manualOverrides.has(state)) return true;
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

  // Show all possible stages in idle state (non-conditional ones only)
  const idleStages = STAGE_META.filter((s) => !s.conditional);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="text-base font-semibold">Process</h2>
        <span className="text-xs text-muted-foreground">In-depth view</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isEmpty && !isRunning ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="space-y-4">
              {idleStages.map((stage) => (
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
              <div className="flex items-center gap-3 text-muted-foreground/25 pl-6">
                <div className="text-left text-xs italic">
                  + Conditional agents (Photographer, Cinematographer, Pose Director, Art Director) activated based on your input
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground/50 mt-8">
              Stages will appear here when you generate a prompt
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
                          {stage.conditional && (
                            <span className="ml-1.5 text-[10px] text-primary/50 font-normal">(conditional)</span>
                          )}
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

                  {expanded && stageEvents.length > 0 && (
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
