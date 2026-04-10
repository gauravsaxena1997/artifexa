"use client";

import { useState } from "react";
import {
  Download,
  Copy,
  Check,
  FileJson,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  downloadCreativeMarkdown,
  downloadCreativeJSON,
  downloadTextPromptOnly,
  bundleToText,
} from "@/lib/creative-downloads";
import { StudioOutputCanvas } from "@/components/studio/StudioOutputCanvas";
import { ScoreBar } from "@/components/studio/ScoreBar";
import type { CreativePromptBundle } from "@/types/creative";
import type { StudioRunMeta } from "@/types";

interface CreativeOutputPanelProps {
  finalOutput: CreativePromptBundle | null;
  qualityScore: number | null;
  error: string | null;
  runMeta?: StudioRunMeta | null;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
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
          <h3 className="font-semibold text-base text-slate-900">Text Prompt</h3>
          <Badge variant="outline" className="text-[10px] gap-1 font-bold uppercase tracking-wider text-slate-500">
            {bundle.medium === "image" ? <ImageIcon className="w-3 h-3" aria-hidden="true" /> : <VideoIcon className="w-3 h-3" aria-hidden="true" />}
            {bundle.medium}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 rounded-lg border-slate-200"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy Prompt"}
        </Button>
      </div>
      <p className="text-xs text-slate-400 font-light italic">
        Ready to paste directly into Google Gemini or any AI image generation platform.
      </p>
      <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-sm leading-relaxed whitespace-pre-wrap text-slate-700 font-medium shadow-inner">
        {bundle.textPrompt}
      </div>
      {bundle.negativePrompt && (
        <div>
          <h4 className="font-bold mb-2 text-[10px] text-slate-400 uppercase tracking-widest">Negative Prompt</h4>
          <div className="rounded-lg bg-rose-50/50 border border-rose-100 p-3 text-xs text-rose-700/70 font-medium italic">
            {bundle.negativePrompt}
          </div>
        </div>
      )}
      {bundle.platformNotes && (
        <div>
          <h4 className="font-bold mb-2 text-[10px] text-slate-400 uppercase tracking-widest">Platform Notes ({bundle.platform})</h4>
          <div className="rounded-lg bg-indigo-50/30 border border-indigo-100/50 p-3 text-xs text-slate-500 font-medium">
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
          <h3 className="font-semibold text-base text-slate-900">JSON Prompt (Structured)</h3>
          <p className="text-xs text-slate-400 mt-1 font-light italic">
            Structured format for API use — more extensive and accurate results with Gemini
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 rounded-lg border-slate-200"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy JSON"}
        </Button>
      </div>
      <div className="rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre text-slate-800 scrollbar-thin scrollbar-thumb-slate-300">
          {JSON.stringify(bundle.jsonPrompt, null, 2)}
        </div>
      </div>
    </div>
  );
}

function AgentsTab({ bundle }: { bundle: CreativePromptBundle }) {
  return (
    <div className="space-y-5 text-sm">
      <div>
        <h3 className="font-semibold text-base text-slate-900">Active Agents</h3>
        <p className="text-xs text-slate-400 mt-1 font-light italic">
          These AI agents collaborated to architect your prompt.
        </p>
      </div>
      <div className="grid gap-3">
        {bundle.activeAgents.map((agent, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm transition-all hover:border-indigo-200 group">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 group-hover:bg-indigo-600 transition-colors">
              <span className="text-xs font-bold text-indigo-700 group-hover:text-white">{i + 1}</span>
            </div>
            <span className="text-sm font-bold text-slate-700">{agent}</span>
          </div>
        ))}
      </div>
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Pipeline Accuracy:</span>
        <span className="text-sm font-bold text-indigo-600">{bundle.qualityScore}/10</span>
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
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = () => {
    if (!finalOutput) return;
    const fullText = bundleToText(finalOutput);
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const actionButtons = finalOutput ? (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-1.5 rounded-lg border-slate-200 shadow-sm"
        onClick={handleCopyAll}
      >
        {copiedAll ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copiedAll ? "Copied!" : "Copy All"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-1.5 rounded-lg border-slate-200 shadow-sm"
        onClick={() => downloadTextPromptOnly(finalOutput)}
      >
        <FileText className="w-3 h-3" />
        .txt
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-1.5 rounded-lg border-slate-200 shadow-sm"
        onClick={() => downloadCreativeMarkdown(finalOutput)}
      >
        <FileText className="w-3 h-3" />
        .md
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-1.5 rounded-lg border-slate-200 shadow-sm"
        onClick={() => downloadCreativeJSON(finalOutput)}
      >
        <FileJson className="w-3 h-3" />
        .json
      </Button>
    </>
  ) : null;

  return (
    <StudioOutputCanvas
      title="Output Prompt"
      runMeta={runMeta}
      hasOutput={!!finalOutput}
      isFullscreen={isFullscreen ?? false}
      onToggleFullscreen={onToggleFullscreen}
      actions={actionButtons}
      footer={qualityScore !== null && finalOutput ? <ScoreBar score={qualityScore} /> : null}
      emptyState={
        <div className="text-center space-y-4 max-w-sm mx-auto animate-fade-in-up">
          <div className="w-20 h-20 mx-auto bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center shadow-inner mb-6 transition-all duration-300 hover:scale-105">
            <Download className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {error ? "Generation Stopped" : "Vision Ready"}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed font-light">
            {error
              ? "The engine encountered an issue. Review the diagnostic trace to continue."
              : "Describe your creative vision to generate structured and natural language prompts for multi-modal engines."}
          </p>
        </div>
      }
    >
      <Tabs defaultValue="text" className="flex flex-col flex-1 min-h-0">
        <div className="px-8 pt-6">
          <TabsList className="bg-slate-100/80 p-1 rounded-full h-auto border border-slate-200/50 shadow-inner flex w-full">
            <TabsTrigger value="text" className="flex-1 text-xs font-bold tracking-wide h-9 px-6 rounded-full data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all duration-300 uppercase">Text Prompt</TabsTrigger>
            <TabsTrigger value="json" className="flex-1 text-xs font-bold tracking-wide h-9 px-6 rounded-full data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all duration-300 uppercase">JSON Prompt</TabsTrigger>
            <TabsTrigger value="agents" className="flex-1 text-xs font-bold tracking-wide h-9 px-6 rounded-full data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all duration-300 uppercase">Agents</TabsTrigger>
          </TabsList>
        </div>
        <ScrollArea className="flex-1 min-h-0 px-8 pb-12 mt-6">
          <TabsContent value="text" className="mt-0 animate-fade-in-up">
            <TextPromptTab bundle={finalOutput!} />
          </TabsContent>
          <TabsContent value="json" className="mt-0 animate-fade-in-up">
            <JsonPromptTab bundle={finalOutput!} />
          </TabsContent>
          <TabsContent value="agents" className="mt-0 animate-fade-in-up">
            <AgentsTab bundle={finalOutput!} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </StudioOutputCanvas>
  );
}
