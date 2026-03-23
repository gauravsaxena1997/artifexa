import { normalizeInput } from "@/lib/agents/normalizer";
import { runPlanner } from "@/lib/agents/planner";
import { runArchitect, runQA } from "@/lib/agents/executor";
import { runCritic } from "@/lib/agents/critic";
import { runFinalizer } from "@/lib/agents/finalizer";
import { extractJSON } from "@/lib/llm/parse";
import type { AgentEvent, RunMemory, OrchestratorState, ArchitectOutput, QAOutput, LLMResponse } from "@/types";

const MAX_REFINEMENT_LOOPS = 1;
const QUALITY_THRESHOLD = 7.5;
const STAGE_DELAY_MS = 1200;

type EventCallback = (event: AgentEvent) => void;

function createEvent(
  state: OrchestratorState,
  agent: AgentEvent["agent"],
  type: AgentEvent["type"],
  message: string,
  persona?: string,
  detail?: string
): AgentEvent {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    state,
    agent,
    persona,
    type,
    message,
    detail,
  };
}

function accumulateUsage(meta: RunMemory["meta"], usage: LLMResponse["usage"]) {
  if (usage) {
    meta.promptTokens += usage.promptTokens;
    meta.completionTokens += usage.completionTokens;
    meta.totalTokensEstimate += usage.totalTokens;
  }
  meta.totalCalls++;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function runProductStudio(
  rawInput: string,
  source: "text" | "ocr",
  onEvent: EventCallback
): Promise<RunMemory> {
  const memory: RunMemory = {
    runId: `run-${Date.now()}`,
    studio: "product",
    status: "IDLE",
    userInput: { raw: rawInput, source },
    normalizedContext: null,
    plan: null,
    architectureDraft: null,
    qaDraft: null,
    critique: null,
    finalOutput: null,
    events: [],
    meta: {
      totalCalls: 0,
      totalTokensEstimate: 0,
      promptTokens: 0,
      completionTokens: 0,
      refinementLoops: 0,
      startedAt: Date.now(),
      completedAt: null,
    },
  };

  const emit = (event: AgentEvent) => {
    memory.events.push(event);
    onEvent(event);
  };

  try {
    // Stage 1: Normalize
    memory.status = "NORMALIZING";
    emit(createEvent("NORMALIZING", "System", "started", "Understanding your requirements..."));
    const normalizeResult = await normalizeInput(rawInput);
    memory.normalizedContext = normalizeResult.result;
    accumulateUsage(memory.meta, normalizeResult.usage);
    emit(
      createEvent(
        "NORMALIZING",
        "System",
        "completed",
        `Identified: ${memory.normalizedContext.inputType} (${memory.normalizedContext.complexity} complexity)`,
        undefined,
        `Goal: ${memory.normalizedContext.productGoal}`
      )
    );

    await delay(STAGE_DELAY_MS);

    // Stage 2: Planner
    memory.status = "PLANNING";
    emit(
      createEvent("PLANNING", "Planner", "started", "Planning product structure...", "Product Manager + UX Thinker")
    );
    const planResult = await runPlanner(memory.normalizedContext);
    memory.plan = planResult.result;
    accumulateUsage(memory.meta, planResult.usage);
    emit(
      createEvent(
        "PLANNING",
        "Planner",
        "completed",
        `PRD created: "${memory.plan.prd.title}" with ${memory.plan.prd.features.length} features across ${memory.plan.prd.phases.length} phases`,
        "Product Manager + UX Thinker",
        `${memory.plan.userJourneys.length} user journeys, ${memory.plan.edgeCases.length} edge cases identified`
      )
    );

    await delay(STAGE_DELAY_MS);

    // Stage 3: Architect
    memory.status = "EXECUTING_ARCHITECT";
    emit(
      createEvent(
        "EXECUTING_ARCHITECT",
        "Executor",
        "started",
        "Designing system architecture...",
        "Tech Architect + Backend Engineer + DB Designer"
      )
    );
    const archResult = await runArchitect(memory.normalizedContext, memory.plan);
    memory.architectureDraft = archResult.result;
    accumulateUsage(memory.meta, archResult.usage);
    emit(
      createEvent(
        "EXECUTING_ARCHITECT",
        "Executor",
        "completed",
        `Architecture designed: ${memory.architectureDraft.hld.components.length} components, ${memory.architectureDraft.lld.apiEndpoints.length} API endpoints, ${memory.architectureDraft.lld.dbSchema.length} tables`,
        "Tech Architect + Backend Engineer + DB Designer"
      )
    );

    await delay(STAGE_DELAY_MS);

    // Stage 4: QA
    memory.status = "EXECUTING_QA";
    emit(createEvent("EXECUTING_QA", "Executor", "started", "Generating test strategy...", "QA Strategist"));
    const qaResult = await runQA(memory.normalizedContext, memory.plan, memory.architectureDraft);
    memory.qaDraft = qaResult.result;
    accumulateUsage(memory.meta, qaResult.usage);
    emit(
      createEvent(
        "EXECUTING_QA",
        "Executor",
        "completed",
        `Test plan created: ${memory.qaDraft.testCases.length} test cases`,
        "QA Strategist"
      )
    );

    await delay(STAGE_DELAY_MS);

    // Stage 5: Critic (with potential refinement loop)
    let loopCount = 0;
    while (loopCount <= MAX_REFINEMENT_LOOPS) {
      memory.status = "REVIEWING";
      emit(
        createEvent(
          "REVIEWING",
          "Critic",
          "started",
          loopCount === 0 ? "Reviewing output quality..." : "Re-reviewing after refinement...",
          "Senior Engineering Reviewer"
        )
      );

      const critiqueResult = await runCritic(memory.plan, memory.architectureDraft!, memory.qaDraft!);
      memory.critique = critiqueResult.result;
      accumulateUsage(memory.meta, critiqueResult.usage);

      const score = memory.critique.score;
      emit(
        createEvent(
          "REVIEWING",
          "Critic",
          "completed",
          `Quality score: ${score}/10 — ${memory.critique.summary}`,
          "Senior Engineering Reviewer",
          `${memory.critique.issues.length} issues found. Target: ${memory.critique.refinementTarget}`
        )
      );

      if (score >= QUALITY_THRESHOLD || loopCount >= MAX_REFINEMENT_LOOPS) {
        break;
      }

      // Refinement loop
      memory.status = "REFINING";
      memory.meta.refinementLoops++;
      loopCount++;

      emit(
        createEvent(
          "REFINING",
          "System",
          "loop",
          `Refining ${memory.critique.refinementTarget} based on critic feedback (loop ${loopCount})...`
        )
      );

      const issuesSummary = memory.critique.issues.map((i) => `[${i.severity}] ${i.description}: ${i.suggestion}`).join("\n");

      if (memory.critique.refinementTarget === "architect" && memory.architectureDraft) {
        const { callLLMWithRetry } = await import("@/lib/llm/gateway");
        const { ARCHITECT_SYSTEM_PROMPT } = await import("@/lib/agents/prompts");
        const refinedRaw = await callLLMWithRetry(
          [
            { role: "system", content: ARCHITECT_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Refine this architecture based on the following issues:\n\n${issuesSummary}\n\nOriginal architecture:\n${JSON.stringify(memory.architectureDraft, null, 2)}`,
            },
          ],
          2048,
          0.3
        );
        memory.architectureDraft = extractJSON<ArchitectOutput>(refinedRaw.content);
        accumulateUsage(memory.meta, refinedRaw.usage);
      } else if (memory.critique.refinementTarget === "qa" && memory.qaDraft) {
        const { callLLMWithRetry } = await import("@/lib/llm/gateway");
        const { QA_SYSTEM_PROMPT } = await import("@/lib/agents/prompts");
        const refinedRaw = await callLLMWithRetry(
          [
            { role: "system", content: QA_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Refine this test plan based on the following issues:\n\n${issuesSummary}\n\nOriginal test plan:\n${JSON.stringify(memory.qaDraft, null, 2)}`,
            },
          ],
          2048,
          0.3
        );
        memory.qaDraft = extractJSON<QAOutput>(refinedRaw.content);
        accumulateUsage(memory.meta, refinedRaw.usage);
      }

      emit(createEvent("REFINING", "System", "completed", `Refinement complete. Re-evaluating...`));
      await delay(STAGE_DELAY_MS);
    }

    await delay(STAGE_DELAY_MS);

    // Stage 6: Finalizer
    memory.status = "FINALIZING";
    emit(createEvent("FINALIZING", "Finalizer", "started", "Preparing final documents...", "Technical Writer"));
    const finalResult = await runFinalizer(memory.plan, memory.architectureDraft!, memory.qaDraft!, memory.critique!);
    memory.finalOutput = finalResult.result;
    accumulateUsage(memory.meta, finalResult.usage);
    emit(
      createEvent(
        "FINALIZING",
        "Finalizer",
        "completed",
        "Final bundle ready for download",
        "Technical Writer",
        memory.finalOutput.executiveSummary
      )
    );

    memory.status = "DONE";
    memory.meta.completedAt = Date.now();
    emit(
      createEvent(
        "DONE",
        "System",
        "completed",
        `Pipeline complete in ${((memory.meta.completedAt - memory.meta.startedAt) / 1000).toFixed(1)}s — ${memory.meta.totalCalls} LLM calls — ${memory.meta.promptTokens + memory.meta.completionTokens} tokens`
      )
    );

    return memory;
  } catch (err) {
    memory.status = "ERROR";
    memory.meta.completedAt = Date.now();
    const message = err instanceof Error ? err.message : "Unknown error";
    emit(createEvent("ERROR", "System", "error", `Pipeline failed: ${message}`));
    throw err;
  }
}
