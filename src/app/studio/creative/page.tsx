"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Palette, Info, X, Activity } from "lucide-react";
import Link from "next/link";
import { CreativeInputPanel } from "@/components/studio/creative/CreativeInputPanel";
import { CreativeProcessView } from "@/components/studio/creative/CreativeProcessView";
import { CreativeOutputPanel } from "@/components/studio/creative/CreativeOutputPanel";
import { useCreativeStream } from "@/hooks/useCreativeStream";
import { CREATIVE_STUDIO_AGENTS } from "@/types/creative";
import type { CreativeMedium } from "@/types/creative";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Snackbar } from "@/components/ui/snackbar";

function AgentInfoDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl shadow-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">AI Agents Pipeline</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Creative Studio uses generic core agents with dynamic personality injection. Conditional agents are activated based on your input.
        </p>
        <div className="space-y-2">
          {CREATIVE_STUDIO_AGENTS.map((agent, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border text-sm ${
                agent.conditional
                  ? "border-dashed border-primary/20 bg-primary/5"
                  : "border-border bg-secondary/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-xs">{agent.coreAgent}</span>
                    <span className="text-muted-foreground/50 text-xs">→</span>
                    <span className="text-primary text-xs font-medium">{agent.persona}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{agent.role}</p>
                </div>
                {agent.conditional && (
                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">
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

export default function CreativeStudioPage() {
  const { events, finalOutput, isRunning, error, runMeta, run } = useCreativeStream();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAgentInfo, setShowAgentInfo] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);

  const handleRun = (
    input: string,
    medium: CreativeMedium,
    source: "text" | "ocr",
    clarificationSummary?: string[]
  ) => {
    setShowProcessModal(true);
    run(input, medium, source, clarificationSummary);
  };

  useEffect(() => {
    if (isRunning) {
      setShowProcessModal(true);
      return;
    }
    if (!isRunning && (finalOutput || error)) {
      setShowProcessModal(false);
    }
  }, [error, finalOutput, isRunning]);

  useEffect(() => {
    if (error) {
      setShowErrorSnackbar(true);
    }
  }, [error]);

  const qualityScore = runMeta?.qualityScore ?? null;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      {!isFullscreen && (
        <header className="shrink-0 border-b border-border glass-panel z-40">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <div className="w-px h-5 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-sm font-semibold leading-none">Creative Studio</h1>
                    <button
                      onClick={() => setShowAgentInfo(true)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="View AI agents pipeline"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Text → Analyze → Direct → Specialize → Review → Prompt
                  </p>
                </div>
              </div>
            </div>
            {runMeta && (
              <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                <span>{runMeta.totalCalls} LLM calls</span>
                <span>{(runMeta.totalTime / 1000).toFixed(1)}s</span>
                {runMeta.totalTokens > 0 && (
                  <span>{runMeta.totalTokens.toLocaleString()} tokens</span>
                )}
                {runMeta.refinementLoops > 0 && (
                  <span>{runMeta.refinementLoops} refinement{runMeta.refinementLoops > 1 ? "s" : ""}</span>
                )}
              </div>
            )}
          </div>
        </header>
      )}

      {/* Split Layout: Input + Output (50 / 50) */}
      <div className="flex-1 overflow-hidden">
        {isFullscreen ? (
          <div className="h-full overflow-y-auto">
            <CreativeOutputPanel
              finalOutput={finalOutput}
              qualityScore={qualityScore}
              error={error}
              runMeta={runMeta}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen((v) => !v)}
            />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 h-full divide-x divide-border">
            <div className="overflow-y-auto min-h-0">
              <CreativeInputPanel onRun={handleRun} isRunning={isRunning} />
            </div>
            <div className="overflow-y-auto min-h-0">
              <CreativeOutputPanel
                finalOutput={finalOutput}
                qualityScore={qualityScore}
                error={error}
                runMeta={runMeta}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(true)}
              />
            </div>
          </div>
        )}
      </div>

      {!isFullscreen && (
        <button
          onClick={() => setShowProcessModal(true)}
          className="fixed bottom-5 right-5 z-40 rounded-full border border-primary/30 bg-background/95 shadow-lg px-4 py-2.5 flex items-center gap-2 hover:border-primary transition-colors"
        >
          <Activity className={`w-4 h-4 ${isRunning ? "text-primary animate-pulse" : "text-primary"}`} />
          <span className="text-xs font-medium">Process</span>
          {events.length > 0 && (
            <span className="text-[10px] rounded-full bg-primary/10 text-primary px-1.5 py-0.5">
              {events.length}
            </span>
          )}
        </button>
      )}

      <Dialog open={showProcessModal} onOpenChange={setShowProcessModal}>
        <DialogContent className="max-w-4xl w-[95vw] h-[78vh] p-0 sm:max-w-4xl" showCloseButton>
          <DialogHeader className="px-5 pt-4 pb-0">
            <DialogTitle className="text-sm">Pipeline Process</DialogTitle>
          </DialogHeader>
          <div className="h-full overflow-y-auto pb-4">
            <CreativeProcessView events={events} isRunning={isRunning} />
          </div>
        </DialogContent>
      </Dialog>

      {showAgentInfo && <AgentInfoDialog onClose={() => setShowAgentInfo(false)} />}

      <Snackbar
        open={showErrorSnackbar && Boolean(error)}
        message={error ?? ""}
        tone="error"
        onClose={() => setShowErrorSnackbar(false)}
      />
    </div>
  );
}
