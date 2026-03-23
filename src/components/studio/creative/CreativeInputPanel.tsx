"use client";

import { useState } from "react";
import { Loader2, Image, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CreativeSampleDialog } from "./CreativeSampleDialog";
import { ClarificationDialog } from "@/components/studio/ClarificationDialog";
import type { CreativeMedium } from "@/types/creative";
import type { ClarificationAnswer, ClarificationPlan } from "@/types/clarification";

interface CreativeInputPanelProps {
  onRun: (
    input: string,
    medium: CreativeMedium,
    source: "text" | "ocr",
    clarificationSummary?: string[]
  ) => void;
  isRunning: boolean;
}

export function CreativeInputPanel({ onRun, isRunning }: CreativeInputPanelProps) {
  const [input, setInput] = useState("");
  const [medium, setMedium] = useState<CreativeMedium>("image");
  const [askCrossQuestions, setAskCrossQuestions] = useState(true);
  const [clarifyOpen, setClarifyOpen] = useState(false);
  const [clarifyLoading, setClarifyLoading] = useState(false);
  const [clarifyPlan, setClarifyPlan] = useState<ClarificationPlan | null>(null);
  const [pendingInput, setPendingInput] = useState("");
  const charLimit = 3000;

  const handleRun = async () => {
    if (input.trim().length === 0 || isRunning) return;

    const raw = input.trim();

    if (!askCrossQuestions) {
      onRun(raw, medium, "text");
      return;
    }

    setPendingInput(raw);
    setClarifyOpen(true);
    setClarifyLoading(true);

    try {
      const response = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "plan", studio: "creative", input: raw, medium }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate clarification questions");
      }

      const data = (await response.json()) as ClarificationPlan;
      setClarifyPlan(data);
    } catch {
      setClarifyOpen(false);
      onRun(raw, medium, "text");
    } finally {
      setClarifyLoading(false);
    }
  };

  const handleClarificationSubmit = async (answers: ClarificationAnswer[]) => {
    if (!clarifyPlan) return;

    setClarifyLoading(true);
    try {
      const response = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "finalize",
          studio: "creative",
          input: pendingInput,
          plan: clarifyPlan,
          answers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to finalize clarification");
      }

      const data = (await response.json()) as { enrichedInput: string; qaSummary: string[] };
      onRun(data.enrichedInput, medium, "text", data.qaSummary);
    } catch {
      onRun(pendingInput, medium, "text");
    } finally {
      setClarifyLoading(false);
      setClarifyOpen(false);
      setClarifyPlan(null);
      setPendingInput("");
    }
  };

  const handleSampleSelect = (sampleInput: string, sampleMedium: CreativeMedium) => {
    setInput(sampleInput);
    setMedium(sampleMedium);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">Input</h2>
        <CreativeSampleDialog onSelect={handleSampleSelect} />
      </div>

      <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
        {/* Medium Selector */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Medium</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMedium("image")}
              disabled={isRunning}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                medium === "image"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <Image className="w-4 h-4" />
              Image Prompt
            </button>
            <button
              onClick={() => setMedium("video")}
              disabled={isRunning}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                medium === "video"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <Video className="w-4 h-4" />
              Video Prompt
            </button>
          </div>
        </div>

        {/* Output Format (disabled for now) */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Output Platform</label>
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg border border-border bg-secondary/30 text-sm">
            <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">G</div>
            <span className="text-muted-foreground">Google Gemini (Imagen)</span>
            <span className="ml-auto text-[10px] text-muted-foreground/60 bg-secondary px-1.5 py-0.5 rounded">Default</span>
          </div>
        </div>

        {/* Text Input */}
        <div className="flex-1 flex flex-col">
          <label className="text-xs font-medium text-muted-foreground mb-1.5">Describe your vision</label>
          <Textarea
            placeholder={
              medium === "image"
                ? "Describe the image you want to create...\n\ne.g. A female model doing a ramp walk inside a high-end fashion studio"
                : "Describe the video scene you want...\n\ne.g. A slow-motion shot of rain falling on a neon-lit Tokyo street at night"
            }
            className="flex-1 min-h-[160px] resize-none bg-secondary/30 border-border text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, charLimit))}
            disabled={isRunning}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>
              {input.length}/{charLimit}
            </span>
            {input.length > charLimit * 0.9 && (
              <span className="text-[var(--warning)]">Near limit</span>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2 mt-2">
            <div>
              <p className="text-xs font-medium">Ask cross questions</p>
              <p className="text-[11px] text-muted-foreground">
                Clarify style and details before prompt generation
              </p>
            </div>
            <Switch
              checked={askCrossQuestions}
              onCheckedChange={setAskCrossQuestions}
              disabled={isRunning}
            />
          </div>
        </div>

        {/* Hint */}
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-primary">Tip:</span> Even vague inputs work — our AI agents will fill in every missing detail (pose, lighting, colors, wardrobe, camera settings) to create a complete, specific prompt.
          </p>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border">
        <Button
          className="w-full"
          disabled={input.trim().length === 0 || isRunning}
          onClick={handleRun}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Generating Prompt...
            </>
          ) : (
            `Generate ${medium === "image" ? "Image" : "Video"} Prompt`
          )}
        </Button>
      </div>

      <ClarificationDialog
        open={clarifyOpen}
        loading={clarifyLoading}
        plan={clarifyPlan}
        onClose={() => {
          if (clarifyLoading) return;
          setClarifyOpen(false);
          setClarifyPlan(null);
          setPendingInput("");
        }}
        onSubmit={handleClarificationSubmit}
      />
    </div>
  );
}
