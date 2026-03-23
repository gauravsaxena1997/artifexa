import { callLLMWithRetry } from "@/lib/llm/gateway";
import { extractJSON } from "@/lib/llm/parse";
import type { ClarificationPlan, ClarificationStudio, ClarificationAnswer, ClarificationResult } from "@/types/clarification";

const CLARIFIER_PROMPT = `You are an Intent Clarifier agent.
Your goal is to generate short, useful clarification questions before running the main pipeline.

Rules:
1) Output ONLY valid JSON.
2) Ask 2 to 4 questions max.
3) Use only question types: "single" or "multi".
4) Every option must include id and label.
5) At most one option per question can have allowsText=true and should be an "other" style option.
6) Questions must be practical and concrete.
7) For creative prompts, focus on style, subject attributes, background, mood, camera/format.
8) For product prompts, focus on audience, scope, platform, timeline, priorities.

Output shape:
{
  "persona": "Intent Clarifier",
  "intentSummary": "brief summary",
  "questions": [
    {
      "id": "q1",
      "type": "single",
      "label": "...",
      "description": "...",
      "required": true,
      "options": [{ "id": "opt_a", "label": "..." }],
      "minSelections": 1,
      "maxSelections": 1
    }
  ]
}`;

function sanitizePlan(raw: ClarificationPlan, studio: ClarificationStudio): ClarificationPlan {
  const questions = Array.isArray(raw.questions) ? raw.questions.slice(0, 4) : [];

  if (questions.length === 0) {
    return fallbackPlan(studio);
  }

  return {
    persona: raw.persona || "Intent Clarifier",
    intentSummary: raw.intentSummary || "Need a bit more detail before generating output.",
    questions: questions.map((q, qi) => {
      const options = Array.isArray(q.options)
        ? q.options
            .filter((o) => o && typeof o.id === "string" && typeof o.label === "string")
            .slice(0, 8)
        : [];

      if (options.length === 0) {
        return {
          id: `q${qi + 1}`,
          type: "single" as const,
          label: q.label || "Please pick one option",
          description: q.description,
          required: true,
          options: [{ id: "opt_other", label: "Other", allowsText: true }],
          minSelections: 1,
          maxSelections: 1,
        };
      }

      const type = q.type === "multi" ? "multi" : "single";

      return {
        id: typeof q.id === "string" ? q.id : `q${qi + 1}`,
        type,
        label: q.label || `Question ${qi + 1}`,
        description: q.description,
        required: q.required !== false,
        options,
        minSelections: type === "single" ? 1 : Math.max(1, q.minSelections ?? 1),
        maxSelections: type === "single" ? 1 : Math.max(1, Math.min(4, q.maxSelections ?? 3)),
      };
    }),
  };
}

function fallbackPlan(studio: ClarificationStudio): ClarificationPlan {
  if (studio === "creative") {
    return {
      persona: "Intent Clarifier",
      intentSummary: "You want a polished creative prompt, but we need a few specifics.",
      questions: [
        {
          id: "q1",
          type: "single",
          label: "What style do you want?",
          required: true,
          options: [
            { id: "photo", label: "Photography" },
            { id: "cinematic", label: "Cinematic" },
            { id: "anime", label: "Anime" },
            { id: "illustration", label: "Illustration" },
            { id: "other", label: "Other", allowsText: true },
          ],
          minSelections: 1,
          maxSelections: 1,
        },
        {
          id: "q2",
          type: "multi",
          label: "Which details matter most?",
          required: true,
          options: [
            { id: "pose", label: "Pose/Expression" },
            { id: "background", label: "Background/Location" },
            { id: "lighting", label: "Lighting" },
            { id: "colors", label: "Color Palette" },
            { id: "camera", label: "Camera/Shot" },
          ],
          minSelections: 1,
          maxSelections: 3,
        },
      ],
    };
  }

  return {
    persona: "Intent Clarifier",
    intentSummary: "You want a product blueprint, but we need a few constraints first.",
    questions: [
      {
        id: "q1",
        type: "single",
        label: "What is your primary target platform?",
        required: true,
        options: [
          { id: "web", label: "Web" },
          { id: "mobile", label: "Mobile" },
          { id: "both", label: "Web + Mobile" },
          { id: "api", label: "API-first" },
        ],
        minSelections: 1,
        maxSelections: 1,
      },
      {
        id: "q2",
        type: "multi",
        label: "Which outcomes are top priority?",
        required: true,
        options: [
          { id: "speed", label: "Fast MVP delivery" },
          { id: "scale", label: "Scalability" },
          { id: "security", label: "Security" },
          { id: "ux", label: "Great UX" },
          { id: "cost", label: "Low cost" },
        ],
        minSelections: 1,
        maxSelections: 3,
      },
    ],
  };
}

export async function generateClarificationPlan(
  studio: ClarificationStudio,
  input: string,
  medium?: "image" | "video"
): Promise<ClarificationPlan> {
  try {
    const response = await callLLMWithRetry(
      [
        { role: "system", content: CLARIFIER_PROMPT },
        {
          role: "user",
          content: `Studio: ${studio}\nMedium: ${medium || "n/a"}\nInput:\n${input}`,
        },
      ],
      1200,
      0.3
    );

    const parsed = extractJSON<ClarificationPlan>(response.content);
    return sanitizePlan(parsed, studio);
  } catch {
    return fallbackPlan(studio);
  }
}

export function buildClarifiedInput(
  originalInput: string,
  plan: ClarificationPlan,
  answers: ClarificationAnswer[]
): ClarificationResult {
  const questionMap = new Map(plan.questions.map((q) => [q.id, q]));

  const qaSummary = answers.flatMap((answer) => {
    const question = questionMap.get(answer.questionId);
    if (!question) return [];

    const optionsById = new Map(question.options.map((o) => [o.id, o]));
    const selected = answer.selectedOptionIds
      .map((id) => {
        const option = optionsById.get(id);
        if (!option) return null;
        const textAddon = option.allowsText ? answer.optionTexts?.[id]?.trim() : "";
        return textAddon ? `${option.label}: ${textAddon}` : option.label;
      })
      .filter((value): value is string => Boolean(value));

    if (selected.length === 0) return [];
    return [`${question.label} ${selected.join(", ")}`];
  });

  const enrichedInput = [
    originalInput.trim(),
    "",
    "Clarifications:",
    ...qaSummary.map((item) => `- ${item}`),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    intentSummary: plan.intentSummary,
    enrichedInput,
    qaSummary,
  };
}
