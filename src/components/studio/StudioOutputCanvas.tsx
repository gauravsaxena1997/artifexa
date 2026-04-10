"use client";

import { useState, type ReactNode } from "react";
import { StudioOutputHeader } from "./StudioOutputHeader";
import { StudioMetricsDialog } from "./StudioMetricsDialog";

interface StudioOutputCanvasProps {
  title?: string;
  runMeta?: {
    totalCalls: number;
    totalTime: number;
    refinementLoops: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
  actions?: ReactNode;
  footer?: ReactNode;
  isFullscreen: boolean;
  onToggleFullscreen?: () => void;
  children: ReactNode;
  emptyState?: ReactNode;
  hasOutput: boolean;
  className?: string;
}

export function StudioOutputCanvas({
  title,
  runMeta,
  actions,
  footer,
  isFullscreen,
  onToggleFullscreen,
  children,
  emptyState,
  hasOutput,
  className = "",
}: StudioOutputCanvasProps) {
  const [showMetrics, setShowMetrics] = useState(false);

  return (
    <div className={`flex flex-col h-full bg-white relative ${isFullscreen ? "max-w-6xl mx-auto w-full border-x border-slate-100 shadow-2xl" : ""} ${className}`}>
      {/* Header with Title, Token Count and Actions */}
      <StudioOutputHeader
        title={title}
        totalTokens={runMeta?.totalTokens}
        onShowMetrics={() => setShowMetrics(true)}
        actions={actions}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {!hasOutput ? (
          <div className="flex-1 flex items-center justify-center p-12">
            {emptyState}
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            {children}
          </div>
        )}
      </div>

      {/* Optional Score/Metric Footer */}
      {hasOutput && footer && (
        <div className="shrink-0 px-8 py-5 border-t border-slate-200 bg-slate-50/80 backdrop-blur-md sticky bottom-0 z-10 transition-all duration-300">
          {footer}
        </div>
      )}

      {/* Unified Metrics Modal */}
      {showMetrics && runMeta && (
        <StudioMetricsDialog
          runMeta={runMeta}
          onClose={() => setShowMetrics(false)}
        />
      )}
    </div>
  );
}
