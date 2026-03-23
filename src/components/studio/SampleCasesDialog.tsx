"use client";

import { useState } from "react";
import { Info, Lightbulb, Copy, Check, ArrowRight } from "lucide-react";
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
import { SAMPLE_CASES } from "@/lib/sample-cases";
import type { SampleCase } from "@/types";

interface SampleCasesDialogProps {
  onSelect: (input: string) => void;
}

export function SampleCasesDialog({ onSelect }: SampleCasesDialogProps) {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUse = (sample: SampleCase) => {
    onSelect(sample.input);
    setOpen(false);
  };

  const difficultyColor = (d: string) => {
    if (d === "simple") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (d === "moderate") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

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
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Sample Use Cases
          </DialogTitle>
          <DialogDescription>
            Explore varied examples — from vague one-liners to complex product visions. Click
            &quot;Use This&quot; to load it directly into the input.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] px-6 pb-6">
          <div className="space-y-4">
            {SAMPLE_CASES.map((sample) => (
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
                      {sample.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {sample.category}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 rounded-md bg-secondary/50 p-3 text-xs text-muted-foreground font-mono leading-relaxed max-h-28 overflow-y-auto">
                  {sample.input.length > 300 ? sample.input.slice(0, 300) + "..." : sample.input}
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
