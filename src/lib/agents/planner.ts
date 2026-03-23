import { callLLMWithRetry } from "@/lib/llm/gateway";
import { extractJSON } from "@/lib/llm/parse";
import { PLANNER_SYSTEM_PROMPT } from "./prompts";
import type { NormalizedContext, PlannerOutput, LLMResponse } from "@/types";

export async function runPlanner(context: NormalizedContext): Promise<{ result: PlannerOutput; usage: LLMResponse["usage"] }> {
  const response = await callLLMWithRetry(
    [
      { role: "system", content: PLANNER_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Here is the structured product context:\n${JSON.stringify(context, null, 2)}`,
      },
    ],
    3072,
    0.4
  );

  return { result: extractJSON<PlannerOutput>(response.content), usage: response.usage };
}
