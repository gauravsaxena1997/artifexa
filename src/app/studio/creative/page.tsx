"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { CreativeInputPanel } from "@/components/studio/creative/CreativeInputPanel";
import { CreativeOutputPanel } from "@/components/studio/creative/CreativeOutputPanel";
import { useCreativeStream } from "@/hooks/useCreativeStream";
import { CREATIVE_STUDIO_AGENTS } from "@/types/creative";
import type { CreativeMedium } from "@/types/creative";
import { CREATIVE_STAGE_META } from "@/config/stage-meta";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { PipelineStatusBadge } from "@/components/studio/PipelineStatusBadge";
import { StudioProcessDialog } from "@/components/studio/StudioProcessDialog";
import { AgentInfoDialog } from "@/components/studio/AgentInfoDialog";
import { Snackbar } from "@/components/ui/snackbar";
import { STUDIO_CONFIG } from "@/config/studios";

export default function CreativeStudioPage() {
  const { events, finalOutput, isRunning, error, runMeta, sessionMeta, run } = useCreativeStream();

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
          name={STUDIO_CONFIG.vision.name}
          icon={<Palette className="w-4 h-4 text-indigo-600" />}
          pipelineFlow="Text &#8594; Analyze &#8594; Direct &#8594; Specialize &#8594; Review &#8594; Prompt"
          onShowAgentInfo={() => setShowAgentInfo(true)}
          runMeta={{ 
            ...sessionMeta, 
            refinementLoops: runMeta?.refinementLoops ?? 0,
          }}
        />

      )}

      {/* Split Layout: Input + Output */}
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
        stageMeta={CREATIVE_STAGE_META}
      />


      {/* Unified Agent Info Dialog */}
      {showAgentInfo && (
        <AgentInfoDialog
          description="Creative Studio uses generic core agents with dynamic personality injection. Conditional agents are activated based on your input."
          agents={CREATIVE_STUDIO_AGENTS}
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
