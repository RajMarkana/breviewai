import { NextResponse, type NextRequest } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";

interface GenerateBody {
  rating: number;
  businessName: string;
  description?: string;
  services?: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rating = clampRating(body.rating);
  const businessName = (body.businessName || "").trim();
  if (!businessName) {
    return NextResponse.json(
      { error: "businessName is required" },
      { status: 400 },
    );
  }

  const description = (body.description || "").trim().slice(0, 600);
  const services = (body.services || "").trim().slice(0, 400);

  const sentiment = sentimentForRating(rating);

  const system = `You write short, authentic Google reviews on behalf of customers.
Rules:
- Sound like a real customer, not marketing copy.
- 1–3 sentences. Vary length and tone across suggestions.
- Never invent specific facts (no fake names, dates, numbers, dish names) unless they appear in the business info.
- No hashtags, no emojis, no quotation marks around the whole review.
- Match the star rating's sentiment: ${sentiment}.
- Return STRICT JSON only.`;

  const user = `Generate 3 distinct review suggestions for this business.

Business name: ${businessName}
Star rating: ${rating} / 5
Description: ${description || "(none)"}
Services / specialties: ${services || "(none)"}

Return JSON with this exact shape:
{"reviews": ["...", "...", "..."]}`;

  const groq = new Groq({ apiKey });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.85,
      max_tokens: 600,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    let parsed: { reviews?: unknown } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "AI returned malformed JSON" },
        { status: 502 },
      );
    }

    const reviews = Array.isArray(parsed.reviews)
      ? parsed.reviews.filter((r): r is string => typeof r === "string").slice(0, 5)
      : [];

    if (reviews.length === 0) {
      return NextResponse.json(
        { error: "No reviews generated" },
        { status: 502 },
      );
    }

    return NextResponse.json({ reviews });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json(
      { error: err.message || "AI request failed" },
      { status: 502 },
    );
  }
}

function clampRating(r: unknown): number {
  const n = Number(r);
  if (!Number.isFinite(n)) return 5;
  return Math.max(1, Math.min(5, Math.round(n)));
}

function sentimentForRating(r: number): string {
  if (r >= 5) return "enthusiastic, specific, glowing";
  if (r === 4) return "positive with a small caveat or area to improve";
  if (r === 3) return "balanced, mixed — likes some things, mentions issues";
  if (r === 2) return "disappointed but constructive";
  return "frustrated but factual, no insults";
}
