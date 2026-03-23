"use client";

import { useState, useCallback, useRef } from "react";
import type { AgentEvent, FinalBundle } from "@/types";

interface StudioStreamState {
  events: AgentEvent[];
  finalOutput: FinalBundle | null;
  isRunning: boolean;
  error: string | null;
  runMeta: {
    totalCalls: number;
    totalTime: number;
    refinementLoops: number;
    qualityScore: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
}

export function useStudioStream() {
  const [state, setState] = useState<StudioStreamState>({
    events: [],
    finalOutput: null,
    isRunning: false,
    error: null,
    runMeta: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setState({
      events: [],
      finalOutput: null,
      isRunning: false,
      error: null,
      runMeta: null,
    });
  }, []);

  const run = useCallback(async (input: string, source: "text" | "ocr" = "text") => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({
      events: [],
      finalOutput: null,
      isRunning: true,
      error: null,
      runMeta: null,
    });

    try {
      const response = await fetch("/api/studio/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, source }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let eventType = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ") && eventType) {
            try {
              const data = JSON.parse(line.slice(6));
              if (eventType === "agent_event") {
                setState((prev) => ({
                  ...prev,
                  events: [...prev.events, data as AgentEvent],
                }));
              } else if (eventType === "final_output") {
                setState((prev) => ({ ...prev, finalOutput: data as FinalBundle }));
              } else if (eventType === "run_complete") {
                setState((prev) => ({
                  ...prev,
                  runMeta: data as StudioStreamState["runMeta"],
                }));
              } else if (eventType === "error") {
                setState((prev) => ({
                  ...prev,
                  error: (data as { message: string }).message,
                }));
              }
            } catch {
              // skip malformed JSON
            }
            eventType = "";
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setState((prev) => ({
          ...prev,
          error: (err as Error).message || "Connection failed",
        }));
      }
    } finally {
      setState((prev) => ({ ...prev, isRunning: false }));
      abortRef.current = null;
    }
  }, []);

  const abort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setState((prev) => ({ ...prev, isRunning: false }));
    }
  }, []);

  return { ...state, run, reset, abort };
}
