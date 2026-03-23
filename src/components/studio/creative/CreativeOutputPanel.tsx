"use client";

import { useState } from "react";
import {
  Download,
  Copy,
  Check,
  FileJson,
  FileText,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Info,
  X,
  Image,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  downloadCreativeMarkdown,
  downloadCreativeJSON,
  downloadTextPromptOnly,
} from "@/lib/creative-downloads";
import type { CreativePromptBundle } from "@/types/creative";

interface RunMeta {
  totalCalls: number;
  totalTime: number;
  refinementLoops: number;
  qualityScore: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface CreativeOutputPanelProps {
  finalOutput: CreativePromptBundle | null;
  qualityScore: number | null;
  error: string | null;
  runMeta?: RunMeta | null;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

function ScoreBar({ score, label: scoreName }: { score: number; label?: string }) {
  const pct = (score / 10) * 100;
  const color =
    score >= 7.5 ? "bg-[var(--success)]" : score >= 5 ? "bg-[var(--warning)]" : "bg-destructive";
  const text =
    score >= 9 ? "Excellent" : score >= 7.5 ? "Good" : score >= 5 ? "Adequate" : "Needs Work";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{scoreName || "Quality Score"}</span>
        <span className="font-semibold">
          {score}/10 — {text}
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TextPromptTab({ bundle }: { bundle: CreativePromptBundle }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(bundle.textPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-base">Text Prompt</h3>
          <Badge variant="outline" className="text-[10px] gap-1">
            {bundle.medium === "image" ? <Image className="w-3 h-3" /> : <Video className="w-3 h-3" />}
            {bundle.medium}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy Prompt"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Ready to paste directly into Google Gemini or any AI image generation platform.
      </p>
      <div className="rounded-lg bg-secondary/50 border border-border p-4 text-sm leading-relaxed whitespace-pre-wrap">
        {bundle.textPrompt}
      </div>
      {bundle.negativePrompt && (
        <div>
          <h4 className="font-semibold mb-2 text-xs text-muted-foreground">Negative Prompt</h4>
          <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3 text-xs text-muted-foreground">
            {bundle.negativePrompt}
          </div>
        </div>
      )}
      {bundle.platformNotes && (
        <div>
          <h4 className="font-semibold mb-2 text-xs text-muted-foreground">Platform Notes ({bundle.platform})</h4>
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-xs text-muted-foreground">
            {bundle.platformNotes}
          </div>
        </div>
      )}
    </div>
  );
}

function JsonPromptTab({ bundle }: { bundle: CreativePromptBundle }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(bundle.jsonPrompt, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">JSON Prompt (Structured)</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Structured format for API use — more extensive and accurate results with Gemini
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy JSON"}
        </Button>
      </div>
      <div className="rounded-lg bg-secondary/50 border border-border overflow-hidden">
        <div className="p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre">
          {JSON.stringify(bundle.jsonPrompt, null, 2)}
        </div>
      </div>
    </div>
  );
}

function AgentsTab({ bundle }: { bundle: CreativePromptBundle }) {
  return (
    <div className="space-y-4 text-sm">
      <h3 className="font-semibold text-base">Active Agents</h3>
      <p className="text-xs text-muted-foreground">
        These AI agents contributed to generating your prompt.
      </p>
      <div className="space-y-2">
        {bundle.activeAgents.map((agent, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">{i + 1}</span>
            </div>
            <span className="text-sm font-medium">{agent}</span>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Quality Score: <span className="font-semibold">{bundle.qualityScore}/10</span>
        </p>
      </div>
    </div>
  );
}

function TokenInfoDialog({ runMeta, onClose }: { runMeta: RunMeta; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Run Details</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground">Input Tokens</p>
              <p className="text-lg font-semibold">{runMeta.promptTokens.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground">Output Tokens</p>
              <p className="text-lg font-semibold">{runMeta.completionTokens.toLocaleString()}</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">Total Tokens</p>
            <p className="text-lg font-semibold">{runMeta.totalTokens.toLocaleString()}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground">LLM Calls</p>
              <p className="text-sm font-semibold">{runMeta.totalCalls}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-semibold">{(runMeta.totalTime / 1000).toFixed(1)}s</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Refinements</p>
              <p className="text-sm font-semibold">{runMeta.refinementLoops}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Limit: 50,000 tokens per run. Usage: {((runMeta.totalTokens / 50000) * 100).toFixed(1)}%
            </p>
            <div className="h-2 rounded-full bg-secondary overflow-hidden mt-1.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  runMeta.totalTokens > 40000 ? "bg-destructive" : runMeta.totalTokens > 25000 ? "bg-[var(--warning)]" : "bg-primary"
                }`}
                style={{ width: `${Math.min((runMeta.totalTokens / 50000) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreativeOutputPanel({
  finalOutput,
  qualityScore,
  error,
  runMeta,
  isFullscreen,
  onToggleFullscreen,
}: CreativeOutputPanelProps) {
  const [activeTab, setActiveTab] = useState<"text" | "json" | "agents">("text");
  const [showTokenInfo, setShowTokenInfo] = useState(false);

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? "max-w-5xl mx-auto w-full" : ""}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold">Output</h2>
          {runMeta && (
            <button
              onClick={() => setShowTokenInfo(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{runMeta.totalTokens.toLocaleString()} tokens</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {finalOutput && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => downloadTextPromptOnly(finalOutput)}
              >
                <FileText className="w-3 h-3" />
                .txt
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => downloadCreativeMarkdown(finalOutput)}
              >
                <FileText className="w-3 h-3" />
                .md
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => downloadCreativeJSON(finalOutput)}
              >
                <FileJson className="w-3 h-3" />
                .json
              </Button>
            </>
          )}
          {onToggleFullscreen && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5 ml-1"
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
              <p className="text-base text-destructive font-medium">Pipeline Error</p>
              <p className="text-sm text-muted-foreground max-w-md">{error}</p>
            </div>
          </div>
        ) : !finalOutput ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center space-y-3">
              <Download className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-base text-muted-foreground">
                Your generated prompt will appear here
              </p>
              <p className="text-xs text-muted-foreground/60">
                Both JSON structured and natural language formats
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Tab bar */}
            <div className="flex gap-1 mx-5 mt-3 p-1 rounded-lg bg-secondary/50">
              {(
                [
                  { key: "text", label: "Text Prompt" },
                  { key: "json", label: "JSON Prompt" },
                  { key: "agents", label: "Agents" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <ScrollArea className="flex-1 px-5 pb-6 mt-3">
              {activeTab === "text" && <TextPromptTab bundle={finalOutput} />}
              {activeTab === "json" && <JsonPromptTab bundle={finalOutput} />}
              {activeTab === "agents" && <AgentsTab bundle={finalOutput} />}
            </ScrollArea>
          </div>
        )}
      </div>

      {qualityScore !== null && finalOutput && (
        <div className="px-5 py-3 border-t border-border">
          <ScoreBar score={qualityScore} />
        </div>
      )}

      {showTokenInfo && runMeta && (
        <TokenInfoDialog runMeta={runMeta} onClose={() => setShowTokenInfo(false)} />
      )}
    </div>
  );
}
