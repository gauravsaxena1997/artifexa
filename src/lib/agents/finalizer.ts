import { callLLMWithRetry } from "@/lib/llm/gateway";
import { extractJSON } from "@/lib/llm/parse";
import type { PlannerOutput, ArchitectOutput, QAOutput, CritiqueOutput, FinalBundle, LLMResponse } from "@/types";

const SUMMARY_PROMPT = `CRITICAL: Your response must be ONLY a raw JSON object. Start with { and end with }.

You are a technical writer. Given the following product studio outputs, produce a JSON object with exactly two fields:
{
  "title": "string — short project name, max 5 words",
  "executiveSummary": "string — 3-5 sentence summary, max 500 characters total"
}

WRITING RULES: Write like a human. No puffery. No words like delve, tapestry, crucial, pivotal, vibrant, seamless. Be specific and direct. Use "is/are" not "serves as".

Output ONLY JSON. No markdown, no explanation.`;

export async function runFinalizer(
  plan: PlannerOutput,
  architecture: ArchitectOutput,
  qa: QAOutput,
  critique: CritiqueOutput
): Promise<{ result: FinalBundle; usage: LLMResponse["usage"] }> {
  const response = await callLLMWithRetry(
    [
      { role: "system", content: SUMMARY_PROMPT },
      {
        role: "user",
        content: `PRD Title: ${plan.prd.title}\nObjective: ${plan.prd.objective}\nFeatures: ${plan.prd.features.map((f) => f.name).join(", ")}\nTech Stack: ${architecture.techStack.frontend.join(", ")} / ${architecture.techStack.backend.join(", ")}\nTest Cases: ${qa.testCases.length}\nQuality Score: ${critique.score}/10\nCritique: ${critique.summary}`,
      },
    ],
    1024,
    0.3
  );

  const summary = extractJSON<{ title: string; executiveSummary: string }>(response.content);

  return {
    result: {
      title: summary.title || plan.prd.title,
      generatedAt: new Date().toISOString(),
      qualityScore: critique.score,
      sections: {
        prd: plan,
        architecture,
        testPlan: qa,
        critique,
      },
      executiveSummary: summary.executiveSummary,
      downloadFormats: ["markdown", "json"],
    },
    usage: response.usage,
  };
}
