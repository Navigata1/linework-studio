import { NextResponse } from "next/server";
import { hasAI, describeImage } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

type ImgIn = { id: string; dataUrl: string; hint?: string };

const SYSTEM =
  "You are a civil engineering field inspector writing the 'Activity Description' line for a daily inspection report photo. " +
  "Write ONE concise, professional sentence (max ~18 words) describing the construction activity or site condition visible. " +
  "Use inspector voice: objective, present tense, no first person, no preamble. Example: 'Contractor placing base rock along north curb line prior to paving.'";

function fallback(hint?: string): string {
  return hint
    ? `Documented site activity — ${hint.replace(/\.[a-z0-9]+$/i, "")}.`
    : "Site condition documented during inspection walk.";
}

async function describeOne(img: ImgIn): Promise<string> {
  const prompt = img.hint ? `Filename hint: ${img.hint}. Write the activity description.` : "Write the activity description.";
  const out = await describeImage(SYSTEM, img.dataUrl, prompt);
  return (out ?? fallback(img.hint)).replace(/^["']|["']$/g, "");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { images?: ImgIn[] };
    const images = body.images ?? [];
    if (!images.length) return NextResponse.json({ descriptions: {}, ai: hasAI() });
    const out: Record<string, string> = {};
    const batchSize = 4; // stay friendly to free-tier rate limits
    for (let i = 0; i < images.length; i += batchSize) {
      const slice = images.slice(i, i + batchSize);
      const results = await Promise.all(slice.map((im) => describeOne(im).then((d) => [im.id, d] as const)));
      results.forEach(([id, d]) => (out[id] = d));
    }
    return NextResponse.json({ descriptions: out, ai: hasAI() });
  } catch {
    return NextResponse.json({ error: "describe_failed" }, { status: 400 });
  }
}
