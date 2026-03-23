import { createHmac } from "node:crypto";
import type { LLMMessage, LLMResponse } from "@/types";

const GATEWAY_INFER_PATH = "/v1/infer";

function getGatewayConfig() {
  const baseUrl = process.env.AI_GATEWAY_BASE_URL?.trim() || "";
  const clientId = process.env.AI_GATEWAY_CLIENT_ID?.trim() || "";
  const clientSecret = process.env.AI_GATEWAY_CLIENT_SECRET?.trim() || "";
  const timeoutMs = Number(process.env.AI_GATEWAY_TIMEOUT_MS || "30000");

  if (!baseUrl || !clientId || !clientSecret) {
    throw new Error(
      "AI gateway credentials missing. Check AI_GATEWAY_BASE_URL, AI_GATEWAY_CLIENT_ID, AI_GATEWAY_CLIENT_SECRET."
    );
  }

  return {
    baseUrl,
    clientId,
    clientSecret,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 30000,
  };
}

function buildSignature(
  timestamp: string,
  method: string,
  path: string,
  rawBody: string,
  secret: string
): string {
  const payload = `${timestamp}.${method}.${path}.${rawBody}`;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export async function callLLM(
  messages: LLMMessage[],
  maxTokens: number = 2048,
  temperature: number = 0.3
): Promise<LLMResponse> {
  const config = getGatewayConfig();
  const timestamp = Date.now().toString();
  const body = { messages, maxTokens, temperature };
  const rawBody = JSON.stringify(body);
  const signature = buildSignature(
    timestamp,
    "POST",
    GATEWAY_INFER_PATH,
    rawBody,
    config.clientSecret
  );

  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}${GATEWAY_INFER_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-gw-client-id": config.clientId,
        "x-gw-timestamp": timestamp,
        "x-gw-signature": signature,
      },
      body: rawBody,
      signal: AbortSignal.timeout(config.timeoutMs),
    });
  } catch (err) {
    const root = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Unable to reach AI gateway at ${config.baseUrl}${GATEWAY_INFER_PATH}. ${root}`
    );
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new Error(
      `Gateway API error (HTTP ${response.status}): ${errorBody.slice(0, 300)}`
    );
  }

  const data = await response.json();
  const text = data?.output?.text;

  if (!text || typeof text !== "string") {
    throw new Error("Gateway returned empty response content");
  }

  return {
    content: text,
    usage: data?.usage
      ? {
          promptTokens: data.usage.promptTokens ?? 0,
          completionTokens: data.usage.completionTokens ?? 0,
          totalTokens: data.usage.totalTokens ?? 0,
        }
      : undefined,
  };
}

export async function callLLMWithRetry(
  messages: LLMMessage[],
  maxTokens: number = 2048,
  temperature: number = 0.3,
  retries: number = 1
): Promise<LLMResponse> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await callLLM(messages, maxTokens, temperature);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}
