"use client";

import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { InputPanel } from "@/components/studio/InputPanel";
import { OutputPanel } from "@/components/studio/OutputPanel";
import { useStudioStream } from "@/hooks/useStudioStream";
import { PRODUCT_STUDIO_AGENTS } from "@/types/creative";
import { PRODUCT_STAGE_META } from "@/config/stage-meta";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { PipelineStatusBadge } from "@/components/studio/PipelineStatusBadge";
import { StudioProcessDialog } from "@/components/studio/StudioProcessDialog";
import { AgentInfoDialog } from "@/components/studio/AgentInfoDialog";
import { Snackbar } from "@/components/ui/snackbar";
import { STUDIO_CONFIG } from "@/config/studios";

export default function ProductStudioPage() {
  const { events, finalOutput, isRunning, error, runMeta, sessionMeta, run } = useStudioStream();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAgentInfo, setShowAgentInfo] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);

  const handleRun = (
    input: string,
    source: "text" | "ocr",
    clarificationSummary?: string[]
  ) => {
    setShowProcessModal(true);
    run(input, source, clarificationSummary);
  };

  useEffect(() => {
    if (isRunning) {
      setTimeout(() => setShowProcessModal(true), 0);
      return;
    }
    if (!isRunning && (finalOutput || error)) {
      setTimeout(() => setShowProcessModal(false), 0);
    }
    if (error) {
      setTimeout(() => setShowErrorSnackbar(true), 0);
    }
  }, [error, finalOutput, isRunning]);

  const qualityScore = runMeta?.qualityScore ?? null;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Unified Studio Header */}
      {!isFullscreen && (
        <StudioHeader
          name={STUDIO_CONFIG.product.name}
          icon={<Package className="w-4 h-4 text-indigo-600" />}
          pipelineFlow="IDEATION &#8594; ARCHITECTURE &#8594; QA &#8594; REVIEW &#8594; FINALIZE"
          onShowAgentInfo={() => setShowAgentInfo(true)}
          runMeta={{ 
            ...sessionMeta, 
            refinementLoops: runMeta?.refinementLoops ?? 0,
          }}
        />

      )}

      {/* Split-Pane IDE Layout */}
      <div className="flex-1 overflow-hidden">
        {isFullscreen ? (
          <div className="h-full overflow-y-auto bg-slate-50/50">
            <OutputPanel
              finalOutput={finalOutput}
              qualityScore={qualityScore}
              error={error}
              runMeta={{ 
                ...sessionMeta, 
                refinementLoops: runMeta?.refinementLoops ?? 0,
                qualityScore: runMeta?.qualityScore ?? 0
              }}
              isFullscreen={isFullscreen}

              onToggleFullscreen={() => setIsFullscreen((v) => !v)}
            />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row h-full">
            {/* Sidebar (Input) */}
            <div className="w-full lg:w-[420px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/30 overflow-y-auto min-h-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative">
              <InputPanel onRun={handleRun} isRunning={isRunning} />
            </div>
            {/* Canvas (Output) */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-white relative">
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.3]" />
              <div className="relative h-full z-10">
                <OutputPanel
                  finalOutput={finalOutput}
                  qualityScore={qualityScore}
                  error={error}
                  runMeta={{ 
                    ...sessionMeta, 
                    refinementLoops: runMeta?.refinementLoops ?? 0,
                    qualityScore: runMeta?.qualityScore ?? 0
                  }}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={() => setIsFullscreen(true)}
                />

              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unified Floating Status Badge */}
      {!isFullscreen && (
        <PipelineStatusBadge
          isRunning={isRunning}
          eventCount={events.length}
          onClick={() => setShowProcessModal(true)}
        />
      )}

      {/* Unified Pipeline Monitor Dialog */}
      <StudioProcessDialog
        open={showProcessModal}
        onOpenChange={setShowProcessModal}
        events={events}
        isRunning={isRunning}
        runMeta={{ 
          ...sessionMeta, 
          refinementLoops: runMeta?.refinementLoops ?? 0,
          qualityScore: runMeta?.qualityScore ?? 0
        }}
        stageMeta={PRODUCT_STAGE_META}
      />


      {/* Unified Agent Info Dialog */}
      {showAgentInfo && (
        <AgentInfoDialog
          description="Product Studio orchestrates a pipeline of specialized micro-agents. Each agent enforces strict architectural constraints."
          agents={PRODUCT_STUDIO_AGENTS}
          onClose={() => setShowAgentInfo(false)}
        />
      )}

      <Snackbar
        open={showErrorSnackbar && Boolean(error)}
        message={error ?? ""}
        tone="error"
        onClose={() => setShowErrorSnackbar(false)}
      />
    </div>
  );
}
