/**
 * Robustly extracts JSON from an LLM response that may contain
 * markdown code fences, explanatory text, or other wrapping.
 */
export function extractJSON<T = unknown>(raw: string): T {
  // Try direct parse first
  try {
    return JSON.parse(raw) as T;
  } catch {
    // continue to extraction
  }

  // Try to find JSON inside markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim()) as T;
    } catch {
      // continue
    }
  }

  // Try to find the outermost { ... } block
  let depth = 0;
  let start = -1;
  let end = -1;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (raw[i] === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        end = i;
        break;
      }
    }
  }

  if (start !== -1 && end !== -1) {
    const candidate = raw.slice(start, end + 1);
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // continue
    }
  }

  throw new Error(
    `Failed to extract JSON from LLM response. First 200 chars: ${raw.slice(0, 200)}`
  );
}
