import { buildClarifiedInput, generateClarificationPlan } from "@/lib/clarification";
import type { ClarificationAnswer, ClarificationStudio } from "@/types/clarification";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action,
      studio,
      input,
      medium,
      plan,
      answers,
    } = body as {
      action: "plan" | "finalize";
      studio: ClarificationStudio;
      input: string;
      medium?: "image" | "video";
      plan?: Awaited<ReturnType<typeof generateClarificationPlan>>;
      answers?: ClarificationAnswer[];
    };

    if (!studio || (studio !== "product" && studio !== "creative")) {
      return new Response(JSON.stringify({ error: "Valid studio is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Input is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "finalize") {
      if (!plan || !Array.isArray(answers)) {
        return new Response(JSON.stringify({ error: "Plan and answers are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const result = buildClarifiedInput(input.trim(), plan, answers);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const generatedPlan = await generateClarificationPlan(studio, input.trim(), medium);

    return new Response(JSON.stringify(generatedPlan), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
