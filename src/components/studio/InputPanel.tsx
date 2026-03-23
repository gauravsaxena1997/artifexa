"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SampleCasesDialog } from "./SampleCasesDialog";

interface InputPanelProps {
  onRun: (input: string, source: "text" | "ocr") => void;
  isRunning: boolean;
}

export function InputPanel({ onRun, isRunning }: InputPanelProps) {
  const [input, setInput] = useState("");
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrFileName, setOcrFileName] = useState<string | null>(null);
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

  const handleRun = () => {
    if (input.trim().length === 0 || isRunning) return;
    onRun(input.trim(), ocrFileName ? "ocr" : "text");
  };

  const handleSampleSelect = (sampleInput: string) => {
    setInput(sampleInput);
    setOcrText(null);
    setOcrFileName(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">Input</h2>
        <SampleCasesDialog onSelect={handleSampleSelect} />
      </div>

      <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
        {ocrText ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Extracted from {ocrFileName}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearOcr} className="h-7 w-7 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3 text-sm max-h-48 overflow-y-auto font-mono text-muted-foreground">
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
              className="flex-1 min-h-[200px] resize-none bg-secondary/30 border-border text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, charLimit))}
              disabled={isRunning}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {input.length}/{charLimit}
              </span>
              {input.length > charLimit * 0.9 && (
                <span className="text-warning">Near limit</span>
              )}
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="rounded-lg border border-dashed border-border hover:border-primary/50 p-4 text-center transition-colors cursor-pointer"
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
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting text...
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Drop image or click to upload (OCR)</span>
                  <span className="text-[10px]">PNG, JPG, BMP — Max 5MB</span>
                </div>
              )}
            </div>
          </>
        )}
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
              Pipeline Running...
            </>
          ) : (
            "Run Pipeline"
          )}
        </Button>
      </div>
    </div>
  );
}
