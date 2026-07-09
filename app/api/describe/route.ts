import { NextResponse } from "next/server";
import { hasAI } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

type ImgIn = { id: string; dataUrl: string; hint?: string };

const SYSTEM =
  "You are a civil engineering field inspector writing the 'Activity Description' line for a daily inspection report photo. " +
  "Write ONE concise, professional sentence (max ~18 words) describing the construction activity or site condition visible. " +
  "Use inspector voice: objective, present tense, no first person, no preamble. Example: 'Contractor placing base rock along north curb line prior to paving.'";

function parseDataUrl(dataUrl: string): { media: string; b64: string } | null {
  const m = /^data:(image\/(?:png|jpe?g|webp));base64,(.*)$/i.exec(dataUrl);
  if (!m) return null;
  return { media: m[1].toLowerCase(), b64: m[2] };
}

function fallback(hint?: string): string {
  const base = "Site condition documented during inspection walk.";
  return hint ? `Documented site activity — ${hint.replace(/\.[a-z0-9]+$/i, "")}.` : base;
}

async function describeOne(img: ImgIn): Promise<string> {
  const parsed = parseDataUrl(img.dataUrl);
  if (!hasAI() || !parsed) return fallback(img.hint);
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 120,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: parsed.media as "image/png" | "image/jpeg" | "image/webp", data: parsed.b64 } },
            { type: "text", text: img.hint ? `Filename hint: ${img.hint}. Write the activity description.` : "Write the activity description." },
          ],
        },
      ],
    });
    const block = res.content.find((b) => b.type === "text");
    const text = block && "text" in block ? block.text.trim().replace(/^["']|["']$/g, "") : "";
    return text || fallback(img.hint);
  } catch {
    return fallback(img.hint);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { images?: ImgIn[] };
    const images = body.images ?? [];
    if (!images.length) return NextResponse.json({ descriptions: {}, ai: hasAI() });
    // Cap concurrency modestly to stay within limits.
    const out: Record<string, string> = {};
    const batchSize = 4;
    for (let i = 0; i < images.length; i += batchSize) {
      const slice = images.slice(i, i + batchSize);
      const results = await Promise.all(slice.map((im) => describeOne(im).then((d) => [im.id, d] as const)));
      results.forEach(([id, d]) => (out[id] = d));
    }
    return NextResponse.json({ descriptions: out, ai: hasAI() });
  } catch (e) {
    return NextResponse.json({ error: "describe_failed" }, { status: 400 });
  }
}
