"use client";

import { useMemo, useState } from "react";
import { Info, Lightbulb, Copy, Check, ArrowRight, Image, Video } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CREATIVE_SAMPLE_CASES } from "@/lib/creative-sample-cases";
import type { CreativeMedium } from "@/types/creative";
import type { CreativeSampleCase } from "@/lib/creative-sample-cases";

interface CreativeSampleDialogProps {
  onSelect: (input: string, medium: CreativeMedium) => void;
}

export function CreativeSampleDialog({ onSelect }: CreativeSampleDialogProps) {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | CreativeSampleCase["difficulty"]>("all");
  const [mediumFilter, setMediumFilter] = useState<"all" | CreativeMedium>("all");

  const filteredSamples = useMemo(() => {
    return CREATIVE_SAMPLE_CASES.filter((sample) => {
      const byDifficulty = difficultyFilter === "all" || sample.difficulty === difficultyFilter;
      const byMedium = mediumFilter === "all" || sample.medium === mediumFilter;
      return byDifficulty && byMedium;
    });
  }, [difficultyFilter, mediumFilter]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUse = (sample: { input: string; medium: CreativeMedium }) => {
    onSelect(sample.input, sample.medium);
    setOpen(false);
  };

  const difficultyColor = (d: string) => {
    if (d === "simple") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (d === "moderate") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  const toLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2" />
        }
      >
        <Lightbulb className="w-4 h-4" />
        <span className="hidden sm:inline">Sample Cases</span>
        <span className="sm:hidden">Samples</span>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-[70vw] sm:max-w-[70vw] max-h-[85vh] min-h-[70vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Creative Sample Cases
          </DialogTitle>
          <DialogDescription>
            Explore examples from vague inputs to detailed scenes. Click &quot;Use This&quot; to
            load it with the correct medium setting.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-2">
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Complexity:</span>
              {(["all", "simple", "moderate", "complex"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficultyFilter(level)}
                  className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${
                    difficultyFilter === level
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {toLabel(level)}
                </button>
              ))}

              <span className="text-xs font-medium text-muted-foreground ml-2">Medium:</span>
              {(["all", "image", "video"] as const).map((medium) => (
                <button
                  key={medium}
                  onClick={() => setMediumFilter(medium)}
                  className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${
                    mediumFilter === medium
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {toLabel(medium)}
                </button>
              ))}

              <button
                onClick={() => {
                  setDifficultyFilter("all");
                  setMediumFilter("all");
                }}
                className="ml-auto text-[11px] text-primary hover:underline"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        <ScrollArea className="h-[58vh] min-h-[58vh] px-6 pb-6">
          <div className="space-y-4">
            {filteredSamples.map((sample) => (
              <div
                key={sample.id}
                className="rounded-lg border border-border p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">{sample.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{sample.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={`text-[10px] ${difficultyColor(sample.difficulty)}`}>
                      {toLabel(sample.difficulty)}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      {sample.medium === "image" ? (
                        <Image className="w-3 h-3" />
                      ) : (
                        <Video className="w-3 h-3" />
                      )}
                      {toLabel(sample.medium)}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {sample.category}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 rounded-md bg-secondary/50 p-3 text-xs text-muted-foreground font-mono leading-relaxed">
                  {sample.input}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1.5"
                    onClick={() => handleCopy(sample.input, sample.id)}
                  >
                    {copiedId === sample.id ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copiedId === sample.id ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    onClick={() => handleUse(sample)}
                  >
                    Use This
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredSamples.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No sample cases match these filters.
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
