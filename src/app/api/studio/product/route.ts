import { runProductStudio } from "@/lib/orchestrator/runner";
import type { AgentEvent } from "@/types";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input, source } = body as { input: string; source: "text" | "ocr" };

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Input is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (input.length > 5000) {
      return new Response(JSON.stringify({ error: "Input exceeds 5000 character limit" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (eventType: string, data: unknown) => {
          const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        };

        const onEvent = (event: AgentEvent) => {
          sendEvent("agent_event", event);
        };

        try {
          const result = await runProductStudio(input.trim(), source || "text", onEvent);
          sendEvent("final_output", result.finalOutput);
          sendEvent("run_complete", {
            runId: result.runId,
            totalCalls: result.meta.totalCalls,
            totalTime: result.meta.completedAt
              ? result.meta.completedAt - result.meta.startedAt
              : 0,
            refinementLoops: result.meta.refinementLoops,
            qualityScore: result.critique?.score ?? 0,
            promptTokens: result.meta.promptTokens,
            completionTokens: result.meta.completionTokens,
            totalTokens: result.meta.totalTokensEstimate,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          sendEvent("error", { message, recoverable: false });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
