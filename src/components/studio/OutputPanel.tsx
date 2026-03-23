"use client";

import { useState } from "react";
import { Download, Copy, Check, FileJson, FileText, AlertTriangle, Maximize2, Minimize2, Info, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { downloadMarkdown, downloadJSON, bundleToMarkdown } from "@/lib/downloads";
import type { FinalBundle } from "@/types";

interface RunMeta {
  totalCalls: number;
  totalTime: number;
  refinementLoops: number;
  qualityScore: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface OutputPanelProps {
  finalOutput: FinalBundle | null;
  qualityScore: number | null;
  error: string | null;
  runMeta?: RunMeta | null;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color =
    score >= 7.5 ? "bg-[var(--success)]" : score >= 5 ? "bg-[var(--warning)]" : "bg-destructive";
  const label =
    score >= 9 ? "Excellent" : score >= 7.5 ? "Good" : score >= 5 ? "Adequate" : "Needs Work";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Quality Score</span>
        <span className="font-semibold">
          {score}/10 — {label}
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PRDTab({ bundle }: { bundle: FinalBundle }) {
  const { prd, userJourneys, edgeCases } = bundle.sections.prd;
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h3 className="font-semibold text-base">{prd.title}</h3>
        <p className="text-muted-foreground mt-1">{prd.objective}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Features ({prd.features.length})</h4>
        <div className="space-y-2">
          {prd.features.map((f, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-secondary/30">
              <Badge
                variant="outline"
                className={`shrink-0 text-[10px] ${
                  f.priority === "high"
                    ? "border-destructive/40 text-destructive"
                    : f.priority === "medium"
                      ? "border-[var(--warning)]/40 text-[var(--warning)]"
                      : "border-muted-foreground/40"
                }`}
              >
                {f.priority}
              </Badge>
              <div>
                <span className="font-medium">{f.name}</span>
                <span className="text-muted-foreground"> — {f.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Phases</h4>
        {prd.phases.map((p) => (
          <div key={p.phase} className="mb-3">
            <div className="flex items-center gap-2">
              <Badge className="text-[10px]">Phase {p.phase}</Badge>
              <span className="font-medium text-sm">{p.name}</span>
              <span className="text-xs text-muted-foreground">({p.estimatedDuration})</span>
            </div>
            <ul className="list-disc list-inside text-muted-foreground text-xs mt-1 ml-4">
              {p.deliverables.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div>
        <h4 className="font-semibold mb-2">User Journeys</h4>
        {userJourneys.map((j, i) => (
          <div key={i} className="mb-3 p-2 rounded-md bg-secondary/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-xs">{j.persona}</span>
              <Badge variant="outline" className="text-[10px]">
                {j.happyPath ? "Happy Path" : "Edge Case"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground italic mb-1">{j.scenario}</p>
            <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-0.5">
              {j.steps.map((s, si) => (
                <li key={si}>{s}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      {edgeCases.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Edge Cases</h4>
          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
            {edgeCases.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ArchTab({ bundle }: { bundle: FinalBundle }) {
  const { techStack, hld, lld, scalabilityNotes } = bundle.sections.architecture;
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h4 className="font-semibold mb-2">Tech Stack</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-secondary/30">
            <span className="text-muted-foreground">Frontend:</span> {techStack.frontend.join(", ")}
          </div>
          <div className="p-2 rounded bg-secondary/30">
            <span className="text-muted-foreground">Backend:</span> {techStack.backend.join(", ")}
          </div>
          <div className="p-2 rounded bg-secondary/30">
            <span className="text-muted-foreground">Database:</span> {techStack.database.join(", ")}
          </div>
          <div className="p-2 rounded bg-secondary/30">
            <span className="text-muted-foreground">Infra:</span> {techStack.infrastructure.join(", ")}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">{techStack.reasoning}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2">High-Level Design</h4>
        <p className="text-muted-foreground text-xs">{hld.overview}</p>
        <div className="mt-2 space-y-1.5">
          {hld.components.map((c, i) => (
            <div key={i} className="p-2 rounded bg-secondary/30 text-xs">
              <span className="font-medium">{c.name}</span>
              <span className="text-muted-foreground"> — {c.responsibility}</span>
              {c.communicatesWith.length > 0 && (
                <p className="text-muted-foreground/60 mt-0.5">
                  Connects to: {c.communicatesWith.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-2">API Endpoints ({lld.apiEndpoints.length})</h4>
        <div className="space-y-1">
          {lld.apiEndpoints.map((ep, i) => (
            <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded bg-secondary/30">
              <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                {ep.method}
              </Badge>
              <code className="text-primary/80 font-mono">{ep.path}</code>
              <span className="text-muted-foreground truncate">{ep.description}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Database Schema</h4>
        {lld.dbSchema.map((t, i) => (
          <div key={i} className="mb-2 p-2 rounded bg-secondary/30 text-xs">
            <span className="font-medium font-mono">{t.table}</span>
            <div className="mt-1 space-y-0.5">
              {t.columns.map((col, ci) => (
                <div key={ci} className="flex gap-2 text-muted-foreground pl-2">
                  <span className="font-mono">{col.name}</span>
                  <span className="text-muted-foreground/60">{col.type}</span>
                  {col.constraints && <span className="text-primary/50">{col.constraints}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {scalabilityNotes && scalabilityNotes.length > 0 && (
        <div>
          <h4 className="font-semibold mb-1">Scalability Notes</h4>
          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
            {scalabilityNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function QATab({ bundle }: { bundle: FinalBundle }) {
  const { testStrategy, testCases } = bundle.sections.testPlan;
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h4 className="font-semibold mb-1">Test Strategy</h4>
        <p className="text-xs text-muted-foreground">{testStrategy}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Test Cases ({testCases.length})</h4>
        <div className="space-y-2">
          {testCases.map((tc) => (
            <div key={tc.id} className="p-2 rounded bg-secondary/30 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] font-mono">{tc.id}</Badge>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    tc.priority === "critical"
                      ? "border-destructive/40 text-destructive"
                      : tc.priority === "high"
                        ? "border-[var(--warning)]/40 text-[var(--warning)]"
                        : ""
                  }`}
                >
                  {tc.priority}
                </Badge>
                <Badge variant="outline" className="text-[10px]">{tc.type}</Badge>
              </div>
              <p className="font-medium">{tc.scenario}</p>
              <ol className="list-decimal list-inside text-muted-foreground mt-1 space-y-0.5">
                {tc.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              <p className="text-[var(--success)] mt-1">Expected: {tc.expectedResult}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CritiqueTab({ bundle }: { bundle: FinalBundle }) {
  const { score, summary, issues } = bundle.sections.critique;
  return (
    <div className="space-y-4 text-sm">
      <ScoreBar score={score} />
      <p className="text-muted-foreground text-xs">{summary}</p>
      {issues.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Issues ({issues.length})</h4>
          <div className="space-y-2">
            {issues.map((issue, i) => (
              <div key={i} className="p-2 rounded bg-secondary/30 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle
                    className={`w-3 h-3 ${
                      issue.severity === "critical"
                        ? "text-destructive"
                        : issue.severity === "major"
                          ? "text-[var(--warning)]"
                          : "text-muted-foreground"
                    }`}
                  />
                  <Badge variant="outline" className="text-[10px]">{issue.severity}</Badge>
                  <Badge variant="outline" className="text-[10px]">{issue.area}</Badge>
                </div>
                <p className="text-muted-foreground">{issue.description}</p>
                <p className="text-primary/80 mt-1">Suggestion: {issue.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
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
              Limit: 50,000 tokens per run. Current usage: {((runMeta.totalTokens / 50000) * 100).toFixed(1)}%
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

export function OutputPanel({ finalOutput, qualityScore, error, runMeta, isFullscreen, onToggleFullscreen }: OutputPanelProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showTokenInfo, setShowTokenInfo] = useState(false);

  const handleCopy = (section: string) => {
    if (!finalOutput) return;
    const md = bundleToMarkdown(finalOutput);
    navigator.clipboard.writeText(md);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

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
                onClick={() => handleCopy("all")}
              >
                {copiedSection === "all" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedSection === "all" ? "Copied!" : "Copy All"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => downloadMarkdown(finalOutput)}
              >
                <FileText className="w-3 h-3" />
                .md
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => downloadJSON(finalOutput)}
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
        {!finalOutput ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center space-y-3">
              <Download className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-base text-muted-foreground">
                {error
                  ? "Run stopped. Fix the issue and retry when ready."
                  : "Your output will appear here after running the pipeline"}
              </p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="prd" className="flex flex-col h-full">
            <TabsList className="mx-5 mt-3 bg-secondary/50 h-9">
              <TabsTrigger value="prd" className="text-sm h-7">PRD</TabsTrigger>
              <TabsTrigger value="arch" className="text-sm h-7">Architecture</TabsTrigger>
              <TabsTrigger value="qa" className="text-sm h-7">QA</TabsTrigger>
              <TabsTrigger value="score" className="text-sm h-7">Score</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-1 px-5 pb-6 mt-3">
              <TabsContent value="prd" className="mt-0">
                <PRDTab bundle={finalOutput} />
              </TabsContent>
              <TabsContent value="arch" className="mt-0">
                <ArchTab bundle={finalOutput} />
              </TabsContent>
              <TabsContent value="qa" className="mt-0">
                <QATab bundle={finalOutput} />
              </TabsContent>
              <TabsContent value="score" className="mt-0">
                <CritiqueTab bundle={finalOutput} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
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
