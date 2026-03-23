import { callLLMWithRetry } from "@/lib/llm/gateway";
import { extractJSON } from "@/lib/llm/parse";
import { ARCHITECT_SYSTEM_PROMPT, QA_SYSTEM_PROMPT } from "./prompts";
import type { NormalizedContext, PlannerOutput, ArchitectOutput, QAOutput, LLMResponse } from "@/types";

export async function runArchitect(
  context: NormalizedContext,
  plan: PlannerOutput
): Promise<{ result: ArchitectOutput; usage: LLMResponse["usage"] }> {
  const response = await callLLMWithRetry(
    [
      { role: "system", content: ARCHITECT_SYSTEM_PROMPT },
      {
        role: "user",
        content: `## Original Product Context\n${JSON.stringify(context, null, 2)}\n\n## Planner Output (PRD + User Journeys)\n${JSON.stringify(plan, null, 2)}`,
      },
    ],
    4096,
    0.4
  );

  return { result: extractJSON<ArchitectOutput>(response.content), usage: response.usage };
}

export async function runQA(
  context: NormalizedContext,
  plan: PlannerOutput,
  architecture: ArchitectOutput
): Promise<{ result: QAOutput; usage: LLMResponse["usage"] }> {
  const response = await callLLMWithRetry(
    [
      { role: "system", content: QA_SYSTEM_PROMPT },
      {
        role: "user",
        content: `## Product Context\n${JSON.stringify(context, null, 2)}\n\n## PRD\n${JSON.stringify(plan, null, 2)}\n\n## Architecture\n${JSON.stringify(architecture, null, 2)}`,
      },
    ],
    3072,
    0.4
  );

  return { result: extractJSON<QAOutput>(response.content), usage: response.usage };
}
