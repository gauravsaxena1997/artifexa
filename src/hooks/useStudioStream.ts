"use client";

import { useState, useCallback, useRef } from "react";
import type { AgentEvent, FinalBundle } from "@/types";
import { formatUserFacingError } from "@/lib/ui-errors";

const PIPELINE_TIMEOUT_MS = 120000;

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

  const run = useCallback(async (
    input: string,
    source: "text" | "ocr" = "text",
    clarificationSummary: string[] = []
  ) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timeoutHandle = window.setTimeout(() => controller.abort("timeout"), PIPELINE_TIMEOUT_MS);

    const now = Date.now();
    const clarificationEvent: AgentEvent | null = clarificationSummary.length > 0
      ? {
          id: `clarify-${now}`,
          timestamp: now,
          state: "NORMALIZING",
          agent: "System",
          persona: "Intent Clarifier",
          type: "completed",
          message: `Clarification complete — ${clarificationSummary.length} answer${clarificationSummary.length > 1 ? "s" : ""} captured`,
          detail: clarificationSummary.slice(0, 3).join(" | "),
        }
      : null;

    setState({
      events: clarificationEvent ? [clarificationEvent] : [],
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
                const rawMessage = (data as { message: string }).message || "Unknown error";
                const userMessage = formatUserFacingError(rawMessage);
                setState((prev) => ({
                  ...prev,
                  error: userMessage,
                  events: [
                    ...prev.events,
                    {
                      id: `stream-error-${Date.now()}`,
                      timestamp: Date.now(),
                      state: prev.events[prev.events.length - 1]?.state ?? "NORMALIZING",
                      agent: "System",
                      persona: "Pipeline Guard",
                      type: "error",
                      message: userMessage,
                    } as AgentEvent,
                  ],
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
        const userMessage = formatUserFacingError((err as Error).message || "Connection failed");
        setState((prev) => ({
          ...prev,
          error: userMessage,
          events: [
            ...prev.events,
            {
              id: `client-error-${Date.now()}`,
              timestamp: Date.now(),
              state: prev.events[prev.events.length - 1]?.state ?? "NORMALIZING",
              agent: "System",
              persona: "Pipeline Guard",
              type: "error",
              message: userMessage,
            } as AgentEvent,
          ],
        }));
      } else {
        const abortedForTimeout = controller.signal.reason === "timeout";
        if (abortedForTimeout) {
          const timeoutMessage = formatUserFacingError("timeout");
          setState((prev) => ({
            ...prev,
            error: timeoutMessage,
            events: [
              ...prev.events,
              {
                id: `timeout-error-${Date.now()}`,
                timestamp: Date.now(),
                state: prev.events[prev.events.length - 1]?.state ?? "NORMALIZING",
                agent: "System",
                persona: "Pipeline Guard",
                type: "error",
                message: timeoutMessage,
              } as AgentEvent,
            ],
          }));
        }
      }
    } finally {
      window.clearTimeout(timeoutHandle);
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
