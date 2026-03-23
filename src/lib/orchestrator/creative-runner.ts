import {
  analyzeCreativeInput,
  runCreativeDirector,
  runPhotographer,
  runCinematographer,
  runPoseDirector,
  runArtDirector,
  runCreativeCritic,
  runPromptAssembler,
} from "@/lib/agents/creative-agents";
import type { LLMResponse } from "@/types";
import type {
  CreativeAgentEvent,
  CreativeRunMemory,
  CreativeOrchestratorState,
  CreativeMedium,
} from "@/types/creative";

const MAX_REFINEMENT_LOOPS = 1;
const QUALITY_THRESHOLD = 7.5;
const STAGE_DELAY_MS = 1200;

type EventCallback = (event: CreativeAgentEvent) => void;

function createEvent(
  state: CreativeOrchestratorState,
  agent: CreativeAgentEvent["agent"],
  type: CreativeAgentEvent["type"],
  message: string,
  persona?: string,
  detail?: string
): CreativeAgentEvent {
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

function accumulateUsage(meta: CreativeRunMemory["meta"], usage: LLMResponse["usage"]) {
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

export async function runCreativeStudio(
  rawInput: string,
  medium: CreativeMedium,
  source: "text" | "ocr",
  onEvent: EventCallback
): Promise<CreativeRunMemory> {
  const memory: CreativeRunMemory = {
    runId: `crun-${Date.now()}`,
    studio: "creative",
    status: "IDLE",
    userInput: { raw: rawInput, source, medium },
    analysis: null,
    vision: null,
    photographySpecs: null,
    cinematographySpecs: null,
    poseSpecs: null,
    artSpecs: null,
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

  const emit = (event: CreativeAgentEvent) => {
    memory.events.push(event);
    onEvent(event);
  };

  try {
    // ── Stage 1: Analyze Input ─────────────────────────────────────────────
    memory.status = "ANALYZING";
    emit(createEvent("ANALYZING", "System", "started", "Analyzing your creative request..."));

    const analyzeResult = await analyzeCreativeInput(rawInput, medium);
    memory.analysis = analyzeResult.result;
    accumulateUsage(memory.meta, analyzeResult.usage);

    const activeList = memory.analysis.activeAgents.join(", ");
    emit(
      createEvent(
        "ANALYZING",
        "System",
        "completed",
        `Detected: ${memory.analysis.style} ${memory.analysis.medium} — ${memory.analysis.subjectType} subject`,
        "Input Analyzer",
        `Active agents: ${activeList}. Concept: ${memory.analysis.expandedConcept}`
      )
    );

    await delay(STAGE_DELAY_MS);

    // ── Stage 2: Creative Director ─────────────────────────────────────────
    memory.status = "DIRECTING";
    emit(
      createEvent("DIRECTING", "Planner", "started", "Defining creative vision...", "Creative Director")
    );

    const visionResult = await runCreativeDirector(memory.analysis);
    memory.vision = visionResult.result;
    accumulateUsage(memory.meta, visionResult.usage);

    emit(
      createEvent(
        "DIRECTING",
        "Planner",
        "completed",
        `Vision: "${memory.vision.title}" — ${memory.vision.mood}`,
        "Creative Director",
        `${memory.vision.concept}. Colors: ${memory.vision.colorPalette.primary}, ${memory.vision.colorPalette.secondary}. Composition: ${memory.vision.composition.framing}`
      )
    );

    await delay(STAGE_DELAY_MS);

    // ── Stage 3: Conditional Executor Agents ───────────────────────────────
    const agents = memory.analysis.activeAgents;

    // Photographer (image medium, photography/cinematic style)
    if (agents.includes("Photographer")) {
      memory.status = "PHOTOGRAPHING";
      emit(
        createEvent("PHOTOGRAPHING", "Executor", "started", "Setting up camera and lighting...", "Photographer")
      );

      const photoResult = await runPhotographer(memory.analysis, memory.vision);
      memory.photographySpecs = photoResult.result;
      accumulateUsage(memory.meta, photoResult.usage);

      emit(
        createEvent(
          "PHOTOGRAPHING",
          "Executor",
          "completed",
          `Camera: ${memory.photographySpecs.camera.lens} at ${memory.photographySpecs.camera.aperture}. Lighting: ${memory.photographySpecs.lighting.type}, ${memory.photographySpecs.lighting.direction}`,
          "Photographer"
        )
      );

      await delay(STAGE_DELAY_MS);
    }

    // Cinematographer (video medium)
    if (agents.includes("Cinematographer")) {
      memory.status = "CINEMATOGRAPHING";
      emit(
        createEvent("CINEMATOGRAPHING", "Executor", "started", "Planning camera movement and shot composition...", "Cinematographer")
      );

      const cinemaResult = await runCinematographer(memory.analysis, memory.vision);
      memory.cinematographySpecs = cinemaResult.result;
      accumulateUsage(memory.meta, cinemaResult.usage);

      emit(
        createEvent(
          "CINEMATOGRAPHING",
          "Executor",
          "completed",
          `Shot: ${memory.cinematographySpecs.shotType}. Movement: ${memory.cinematographySpecs.cameraMovement}. Angle: ${memory.cinematographySpecs.angle}`,
          "Cinematographer"
        )
      );

      await delay(STAGE_DELAY_MS);
    }

    // Pose Director (humans present)
    if (agents.includes("Pose Director")) {
      memory.status = "POSE_DIRECTING";
      emit(
        createEvent("POSE_DIRECTING", "Executor", "started", "Directing pose, wardrobe, and expression...", "Pose Director")
      );

      const poseResult = await runPoseDirector(memory.analysis, memory.vision);
      memory.poseSpecs = poseResult.result;
      accumulateUsage(memory.meta, poseResult.usage);

      emit(
        createEvent(
          "POSE_DIRECTING",
          "Executor",
          "completed",
          `Pose: ${memory.poseSpecs.pose}. Expression: ${memory.poseSpecs.expression}. Wardrobe: ${memory.poseSpecs.wardrobe.clothing}`,
          "Pose Director"
        )
      );

      await delay(STAGE_DELAY_MS);
    }

    // Art Director (artistic styles)
    if (agents.includes("Art Director")) {
      memory.status = "ART_DIRECTING";
      emit(
        createEvent("ART_DIRECTING", "Executor", "started", "Defining art style and technique...", "Art Director")
      );

      const artResult = await runArtDirector(memory.analysis, memory.vision);
      memory.artSpecs = artResult.result;
      accumulateUsage(memory.meta, artResult.usage);

      emit(
        createEvent(
          "ART_DIRECTING",
          "Executor",
          "completed",
          `Style: ${memory.artSpecs.artStyle}. Technique: ${memory.artSpecs.technique}. Medium: ${memory.artSpecs.medium}`,
          "Art Director"
        )
      );

      await delay(STAGE_DELAY_MS);
    }

    // ── Stage 4: Critic (with potential refinement loop) ───────────────────
    let loopCount = 0;
    while (loopCount <= MAX_REFINEMENT_LOOPS) {
      memory.status = "REVIEWING";
      emit(
        createEvent(
          "REVIEWING",
          "Critic",
          "started",
          loopCount === 0 ? "Reviewing prompt for vagueness..." : "Re-reviewing after refinement...",
          "Prompt Quality Reviewer"
        )
      );

      const critiqueResult = await runCreativeCritic(
        memory.analysis,
        memory.vision!,
        memory.photographySpecs,
        memory.cinematographySpecs,
        memory.poseSpecs,
        memory.artSpecs
      );
      memory.critique = critiqueResult.result;
      accumulateUsage(memory.meta, critiqueResult.usage);

      const score = memory.critique.overallScore;
      const vagueCount = memory.critique.vagueElements.length;
      emit(
        createEvent(
          "REVIEWING",
          "Critic",
          "completed",
          `Specificity: ${memory.critique.specificityScore}/10 — Completeness: ${memory.critique.completenessScore}/10 — Overall: ${score}/10`,
          "Prompt Quality Reviewer",
          vagueCount > 0
            ? `${vagueCount} vague element${vagueCount > 1 ? "s" : ""} found: ${memory.critique.vagueElements.slice(0, 3).join(", ")}`
            : "No vague elements detected"
        )
      );

      if (score >= QUALITY_THRESHOLD || loopCount >= MAX_REFINEMENT_LOOPS) {
        break;
      }

      // Refinement loop — re-run the target agent
      memory.status = "REFINING";
      memory.meta.refinementLoops++;
      loopCount++;

      const target = memory.critique.refinementTarget;
      emit(
        createEvent(
          "REFINING",
          "System",
          "loop",
          `Refining ${target} based on critic feedback (loop ${loopCount})...`
        )
      );

      if (target === "vision") {
        const visionResult = await runCreativeDirector(memory.analysis);
        memory.vision = visionResult.result;
        accumulateUsage(memory.meta, visionResult.usage);
      } else if (target === "photography" && memory.photographySpecs) {
        const photoResult = await runPhotographer(memory.analysis, memory.vision!);
        memory.photographySpecs = photoResult.result;
        accumulateUsage(memory.meta, photoResult.usage);
      } else if (target === "cinematography" && memory.cinematographySpecs) {
        const cinemaResult = await runCinematographer(memory.analysis, memory.vision!);
        memory.cinematographySpecs = cinemaResult.result;
        accumulateUsage(memory.meta, cinemaResult.usage);
      } else if (target === "pose" && memory.poseSpecs) {
        const poseResult = await runPoseDirector(memory.analysis, memory.vision!);
        memory.poseSpecs = poseResult.result;
        accumulateUsage(memory.meta, poseResult.usage);
      } else if (target === "art" && memory.artSpecs) {
        const artResult = await runArtDirector(memory.analysis, memory.vision!);
        memory.artSpecs = artResult.result;
        accumulateUsage(memory.meta, artResult.usage);
      }

      emit(createEvent("REFINING", "System", "completed", "Refinement complete. Re-evaluating..."));
      await delay(STAGE_DELAY_MS);
    }

    await delay(STAGE_DELAY_MS);

    // ── Stage 5: Assemble Final Prompts ────────────────────────────────────
    memory.status = "ASSEMBLING";
    emit(
      createEvent("ASSEMBLING", "Finalizer", "started", "Assembling final prompts...", "Prompt Assembler")
    );

    const assembleResult = await runPromptAssembler(
      memory.analysis,
      memory.vision!,
      memory.photographySpecs,
      memory.cinematographySpecs,
      memory.poseSpecs,
      memory.artSpecs,
      memory.critique!
    );
    memory.finalOutput = assembleResult.result;
    accumulateUsage(memory.meta, assembleResult.usage);

    emit(
      createEvent(
        "ASSEMBLING",
        "Finalizer",
        "completed",
        "Prompt bundle ready — JSON and text formats generated",
        "Prompt Assembler",
        `Title: "${memory.finalOutput.title}". Text prompt: ${memory.finalOutput.textPrompt.length} characters`
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
