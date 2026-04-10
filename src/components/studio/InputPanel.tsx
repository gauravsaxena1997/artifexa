"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StudioToggle } from "./StudioToggle";
import { SampleCasesDialog } from "./SampleCasesDialog";
import { ClarificationDialog } from "./ClarificationDialog";
import type { ClarificationAnswer, ClarificationPlan } from "@/types/clarification";

interface InputPanelProps {
  onRun: (input: string, source: "text" | "ocr", clarificationSummary?: string[]) => void;
  isRunning: boolean;
}

export function InputPanel({ onRun, isRunning }: InputPanelProps) {
  const [input, setInput] = useState("");
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrFileName, setOcrFileName] = useState<string | null>(null);
  const [askCrossQuestions, setAskCrossQuestions] = useState(true);
  const [clarifyOpen, setClarifyOpen] = useState(false);
  const [clarifyLoading, setClarifyLoading] = useState(false);
  const [clarifyPlan, setClarifyPlan] = useState<ClarificationPlan | null>(null);
  const [pendingInput, setPendingInput] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const charLimit = 5000;

  const handleFileUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Max 5MB.");
      return;
    }
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/bmp"];
    if (!validTypes.includes(file.type)) {
      alert("Supported formats: PNG, JPG, BMP");
      return;
    }

    setOcrLoading(true);
    setOcrFileName(file.name);

    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const {
        data: { text },
      } = await worker.recognize(file);
      await worker.terminate();
      if (text.trim()) {
        setOcrText(text.trim());
      } else {
        alert("Could not extract text. Try a clearer image.");
        setOcrFileName(null);
      }
    } catch {
      alert("OCR failed. Please try again.");
      setOcrFileName(null);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const confirmOcr = () => {
    if (ocrText) {
      setInput(ocrText);
      setOcrText(null);
    }
  };

  const clearOcr = () => {
    setOcrText(null);
    setOcrFileName(null);
  };

  const handleRun = async () => {
    if (input.trim().length === 0 || isRunning) return;

    const source = ocrFileName ? "ocr" : "text";
    const raw = input.trim();

    if (!askCrossQuestions) {
      onRun(raw, source);
      return;
    }

    setPendingInput(raw);
    setClarifyOpen(true);
    setClarifyLoading(true);

    try {
      const response = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "plan", studio: "product", input: raw }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate clarification questions");
      }

      const data = (await response.json()) as ClarificationPlan;
      setClarifyPlan(data);
    } catch {
      setClarifyOpen(false);
      onRun(raw, source);
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
          studio: "product",
          input: pendingInput,
          plan: clarifyPlan,
          answers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to finalize clarification");
      }

      const data = (await response.json()) as { enrichedInput: string; qaSummary: string[] };
      onRun(data.enrichedInput, ocrFileName ? "ocr" : "text", data.qaSummary);
    } catch {
      onRun(pendingInput, ocrFileName ? "ocr" : "text");
    } finally {
      setClarifyLoading(false);
      setClarifyOpen(false);
      setClarifyPlan(null);
      setPendingInput("");
    }
  };

  const handleSampleSelect = (sampleInput: string) => {
    setInput(sampleInput);
    setOcrText(null);
    setOcrFileName(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Workspace Input</h2>
        <SampleCasesDialog onSelect={handleSampleSelect} />
      </div>

      <div className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto">
        {ocrText ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-600 font-medium">Extracted from {ocrFileName}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearOcr} className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white shadow-inner p-4 text-sm max-h-48 overflow-y-auto font-mono text-slate-600 leading-relaxed scrollbar-thin scrollbar-thumb-slate-200">
              {ocrText}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={confirmOcr} className="flex-1">
                Use This Text
              </Button>
              <Button size="sm" variant="outline" onClick={clearOcr}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Textarea
              placeholder="Describe your product idea, paste a feature request, or upload a document..."
              className="flex-1 min-h-[220px] resize-none bg-white border-slate-200 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 text-sm p-4 rounded-xl placeholder:text-slate-400 transition-all duration-200"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, charLimit))}
              disabled={isRunning}
            />
            <div className="flex items-center justify-between text-xs font-medium text-slate-400 px-1">
              <span>
                {input.length} / {charLimit}
              </span>
              {input.length > charLimit * 0.9 && (
                <span className="text-amber-500">Near limit</span>
              )}
            </div>

            <StudioToggle
              checked={askCrossQuestions}
              onCheckedChange={setAskCrossQuestions}
              disabled={isRunning}
              description="Prompt clarification cycle prior to pipeline execution."
            />

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 p-6 text-center transition-all duration-200 cursor-pointer group flex flex-col items-center justify-center min-h-[120px]"
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg,image/bmp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              {ocrLoading ? (
                <div className="flex items-center justify-center gap-3 text-sm font-medium text-indigo-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Extracting text with OCR...
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-indigo-600 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium">Drop an image blueprint here</span>
                  <span className="text-xs text-slate-400">PNG, JPG formats — Max 5MB</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="px-6 py-5 border-t border-slate-200 bg-white sticky bottom-0 z-10">
        <Button
          className="w-full h-12 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-sm shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] transition-all duration-300"
          disabled={input.trim().length === 0 || isRunning}
          onClick={handleRun}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Initializing Matrices...
            </>
          ) : (
            "Engage Pipeline Workspace"
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
