import { callLLMWithRetry } from "@/lib/llm/gateway";
import { extractJSON } from "@/lib/llm/parse";
import { NORMALIZER_SYSTEM_PROMPT } from "./prompts";
import type { NormalizedContext, LLMResponse } from "@/types";

export async function normalizeInput(rawInput: string): Promise<{ result: NormalizedContext; usage: LLMResponse["usage"] }> {
  const response = await callLLMWithRetry(
    [
      { role: "system", content: NORMALIZER_SYSTEM_PROMPT },
      { role: "user", content: rawInput },
    ],
    1024,
    0.3
  );

  return { result: extractJSON<NormalizedContext>(response.content), usage: response.usage };
}
