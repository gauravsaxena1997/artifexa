import { callLLMWithRetry } from "@/lib/llm/gateway";
import { extractJSON } from "@/lib/llm/parse";
import { CRITIC_SYSTEM_PROMPT } from "./prompts";
import type { PlannerOutput, ArchitectOutput, QAOutput, CritiqueOutput, LLMResponse } from "@/types";

export async function runCritic(
  plan: PlannerOutput,
  architecture: ArchitectOutput,
  qa: QAOutput
): Promise<{ result: CritiqueOutput; usage: LLMResponse["usage"] }> {
  const response = await callLLMWithRetry(
    [
      { role: "system", content: CRITIC_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Review the following complete output bundle:\n\n## PRD\n${JSON.stringify(plan, null, 2)}\n\n## Architecture\n${JSON.stringify(architecture, null, 2)}\n\n## Test Plan\n${JSON.stringify(qa, null, 2)}`,
      },
    ],
    1024,
    0.3
  );

  return { result: extractJSON<CritiqueOutput>(response.content), usage: response.usage };
}
