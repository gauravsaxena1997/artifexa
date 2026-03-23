"use client";

import { useState } from "react";
import { ArrowLeft, Package, Info, X } from "lucide-react";
import Link from "next/link";
import { InputPanel } from "@/components/studio/InputPanel";
import { ProcessView } from "@/components/studio/ProcessView";
import { OutputPanel } from "@/components/studio/OutputPanel";
import { useStudioStream } from "@/hooks/useStudioStream";
import { PRODUCT_STUDIO_AGENTS } from "@/types/creative";

type MobileTab = "input" | "process" | "output";

function ProductAgentInfoDialog({ onClose }: { onClose: () => void }) {
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
          Product Studio uses generic core agents with dynamic personality injection. Each agent plays a specialized role in the pipeline.
        </p>
        <div className="space-y-2">
          {PRODUCT_STUDIO_AGENTS.map((agent, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-border bg-secondary/30 text-sm"
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductStudioPage() {
  const { events, finalOutput, isRunning, error, runMeta, run } = useStudioStream();
  const [mobileTab, setMobileTab] = useState<MobileTab>("input");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAgentInfo, setShowAgentInfo] = useState(false);

  const handleRun = (input: string, source: "text" | "ocr") => {
    setMobileTab("process");
    run(input, source);
  };

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
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-sm font-semibold leading-none">Product Studio</h1>
                    <button
                      onClick={() => setShowAgentInfo(true)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="View AI agents pipeline"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Idea → PRD → Architecture → QA → Download
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

      {/* Mobile Tab Bar */}
      {!isFullscreen && (
        <div className="lg:hidden shrink-0 border-b border-border bg-card/50">
          <div className="flex">
            {(["input", "process", "output"] as MobileTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                className={`flex-1 py-2.5 text-xs font-medium text-center capitalize transition-colors ${
                  mobileTab === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
                {tab === "output" && finalOutput && (
                  <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-[var(--success)] inline-block" />
                )}
                {tab === "process" && isRunning && (
                  <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Desktop: 3-panel layout / Mobile: tab content */}
      <div className="flex-1 overflow-hidden">
        {isFullscreen ? (
          <div className="h-full overflow-y-auto">
            <OutputPanel
              finalOutput={finalOutput}
              qualityScore={qualityScore}
              error={error}
              runMeta={runMeta}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen((v) => !v)}
            />
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:grid lg:grid-cols-[280px_1fr_1fr] h-full divide-x divide-border">
              <div className="overflow-y-auto">
                <InputPanel onRun={handleRun} isRunning={isRunning} />
              </div>
              <div className="overflow-y-auto">
                <ProcessView events={events} isRunning={isRunning} />
              </div>
              <div className="overflow-y-auto">
                <OutputPanel
                  finalOutput={finalOutput}
                  qualityScore={qualityScore}
                  error={error}
                  runMeta={runMeta}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={() => setIsFullscreen(true)}
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="lg:hidden h-full">
              <div className={mobileTab === "input" ? "h-full" : "hidden"}>
                <InputPanel onRun={handleRun} isRunning={isRunning} />
              </div>
              <div className={mobileTab === "process" ? "h-full overflow-y-auto" : "hidden"}>
                <ProcessView events={events} isRunning={isRunning} />
              </div>
              <div className={mobileTab === "output" ? "h-full overflow-y-auto" : "hidden"}>
                <OutputPanel
                  finalOutput={finalOutput}
                  qualityScore={qualityScore}
                  error={error}
                  runMeta={runMeta}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={() => setIsFullscreen(true)}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {showAgentInfo && <ProductAgentInfoDialog onClose={() => setShowAgentInfo(false)} />}
    </div>
  );
}
