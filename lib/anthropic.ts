// Guarded Claude access. When ANTHROPIC_API_KEY is missing, callers use their
// own deterministic fallback — the tools still work, just without AI prose.

export function hasAI(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const MODEL = "claude-sonnet-5";

/**
 * Single-shot text completion. Returns null on any failure so callers can fall
 * back cleanly. Uses dynamic import so the SDK is never required at build time.
 */
export async function askClaude(system: string, user: string, maxTokens = 700): Promise<string | null> {
  if (!hasAI()) return null;
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    });
    const block = res.content.find((b) => b.type === "text");
    return block && "text" in block ? block.text.trim() : null;
  } catch {
    return null;
  }
}
