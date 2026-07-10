// Provider-agnostic AI layer. Preference order:
//   1. OpenRouter (OPENROUTER_API_KEY) — works with free/cheap models,
//      e.g. OPENROUTER_MODEL=qwen/qwen2.5-vl-72b-instruct:free
//   2. Anthropic (ANTHROPIC_API_KEY)
//   3. null → callers fall back to deterministic templates.
// All calls fail soft: any error returns null, never breaks a tool.

const OR_URL = "https://openrouter.ai/api/v1/chat/completions";
const OR_DEFAULT_MODEL = "google/gemini-2.0-flash-001"; // cheap + vision; override via OPENROUTER_MODEL
const ANTHROPIC_MODEL = "claude-sonnet-5";

export function hasAI(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY);
}

type ORContent = string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;

async function openRouter(system: string, content: ORContent, maxTokens: number): Promise<string | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(OR_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://brainloftstudios.com",
        "X-Title": "Brain Loft Studios",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || OR_DEFAULT_MODEL,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content },
        ],
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content;
    return typeof text === "string" && text.trim() ? text.trim() : null;
  } catch {
    return null;
  }
}

async function anthropicText(system: string, user: string, maxTokens: number): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({
      model: ANTHROPIC_MODEL,
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

async function anthropicVision(system: string, dataUrl: string, prompt: string, maxTokens: number): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const m = /^data:(image\/(?:png|jpe?g|webp));base64,(.*)$/i.exec(dataUrl);
  if (!m) return null;
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: m[1].toLowerCase() as "image/png" | "image/jpeg" | "image/webp", data: m[2] } },
            { type: "text", text: prompt },
          ],
        },
      ],
    });
    const block = res.content.find((b) => b.type === "text");
    return block && "text" in block ? block.text.trim() : null;
  } catch {
    return null;
  }
}

/** Plain text completion via whichever provider is configured. */
export async function askText(system: string, user: string, maxTokens = 700): Promise<string | null> {
  return (await openRouter(system, user, maxTokens)) ?? (await anthropicText(system, user, maxTokens));
}

/** Vision completion (data-URL image) via whichever provider is configured. */
export async function describeImage(system: string, dataUrl: string, prompt: string, maxTokens = 160): Promise<string | null> {
  const or = await openRouter(system, [
    { type: "image_url", image_url: { url: dataUrl } },
    { type: "text", text: prompt },
  ], maxTokens);
  return or ?? (await anthropicVision(system, dataUrl, prompt, maxTokens));
}
