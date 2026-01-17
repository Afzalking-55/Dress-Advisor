import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * This route returns clothing detection in the format your Upload page expects:
 * {
 *  clothType?: string;
 *  category?: "Top"|"Bottom"|"Shoes"|"Other";
 *  bestOccasions?: string[];
 *  avoidOccasions?: string[];
 *  confidence?: number; // 0..1
 * }
 */

type ZSResult = { label: string; score: number };

const HF_ZS_MODEL =
  "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";

/** small helper */
function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function normalize(s: string) {
  return (s || "").toLowerCase().trim();
}

function pickTop(results: ZSResult[]) {
  if (!Array.isArray(results)) return null;
  return results.sort((a, b) => b.score - a.score)[0] ?? null;
}

function mapToCategory(clothType: string): "Top" | "Bottom" | "Shoes" | "Other" {
  const t = normalize(clothType);

  // shoes
  if (
    t.includes("shoe") ||
    t.includes("sneaker") ||
    t.includes("boot") ||
    t.includes("loafer") ||
    t.includes("sandal") ||
    t.includes("heel") ||
    t.includes("slipper")
  )
    return "Shoes";

  // bottoms
  if (
    t.includes("jeans") ||
    t.includes("pants") ||
    t.includes("trouser") ||
    t.includes("short") ||
    t.includes("skirt") ||
    t.includes("cargo") ||
    t.includes("jogger")
  )
    return "Bottom";

  // tops
  if (
    t.includes("t-shirt") ||
    t.includes("tee") ||
    t.includes("shirt") ||
    t.includes("hoodie") ||
    t.includes("sweater") ||
    t.includes("jacket") ||
    t.includes("blazer") ||
    t.includes("kurta") ||
    t.includes("top")
  )
    return "Top";

  return "Other";
}

function suggestOccasions(
  category: "Top" | "Bottom" | "Shoes" | "Other",
  clothType: string
) {
  const t = normalize(clothType);

  // Default
  let bestOccasions = ["Casual", "College"];
  let avoidOccasions: string[] = [];

  // Office-style
  if (
    t.includes("blazer") ||
    t.includes("formal") ||
    t.includes("shirt") ||
    t.includes("trouser") ||
    t.includes("pants")
  ) {
    bestOccasions = ["Office", "Meeting"];
    avoidOccasions = ["Party"];
  }

  // Party/date vibe
  if (t.includes("jacket") || t.includes("coat")) {
    bestOccasions = ["Party", "Date"];
  }

  // Shoes logic
  if (category === "Shoes") {
    if (t.includes("sneaker")) bestOccasions = ["College", "Casual"];
    if (t.includes("loafer") || t.includes("formal"))
      bestOccasions = ["Office", "Meeting"];
    if (t.includes("heel")) bestOccasions = ["Party", "Wedding", "Date"];
  }

  // Wedding special
  if (t.includes("kurta") || t.includes("ethnic")) {
    bestOccasions = ["Wedding", "Party"];
    avoidOccasions = ["College"];
  }

  return { bestOccasions, avoidOccasions };
}

/**
 * HuggingFace zero-shot classification call
 */
async function hfZeroShot({
  token,
  imageBase64,
  labels,
}: {
  token: string;
  imageBase64: string;
  labels: string[];
}) {
  const base64Data = imageBase64.split(",").pop()!;
  const buffer = Buffer.from(base64Data, "base64");

  const res = await fetch(HF_ZS_MODEL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: buffer.toString("base64"), // HF accepts base64 string
      parameters: {
        candidate_labels: labels,
      },
    }),
  });

  const text = await res.text();

  // HF sometimes returns HTML error page
  if (text.trim().startsWith("<")) {
    return { ok: false as const, error: "HF returned HTML" };
  }

  try {
    const json = JSON.parse(text);
    return { ok: true as const, json };
  } catch {
    return { ok: false as const, error: "HF JSON parse failed" };
  }
}

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { ok: false, error: "imageBase64 missing" },
        { status: 400 }
      );
    }

    const HF_TOKEN = process.env.HF_TOKEN;

    // ✅ If token missing → fallback response
    if (!HF_TOKEN) {
      return NextResponse.json({
        clothType: "outfit",
        category: "Other",
        bestOccasions: ["Casual", "College"],
        avoidOccasions: [],
        confidence: 0.2,
        notes: "HF_TOKEN missing → fallback",
      });
    }

    /**
     * Step 1: classify clothType (more specific)
     */
    const clothTypeLabels = [
      "t-shirt",
      "shirt",
      "hoodie",
      "sweater",
      "jacket",
      "blazer",
      "kurta",
      "jeans",
      "pants",
      "trousers",
      "shorts",
      "skirt",
      "sneakers",
      "shoes",
      "boots",
      "sandals",
      "dress",
      "outfit",
      "other",
    ];

    const clothTypeRes = await hfZeroShot({
      token: HF_TOKEN,
      imageBase64,
      labels: clothTypeLabels,
    });

    if (!clothTypeRes.ok) {
      return NextResponse.json({
        clothType: "outfit",
        category: "Other",
        bestOccasions: ["Casual", "College"],
        avoidOccasions: [],
        confidence: 0.3,
        notes: clothTypeRes.error,
      });
    }

    // HF returns something like:
    // { sequence: "...", labels: [...], scores: [...] }
    const labels = clothTypeRes.json?.labels as string[] | undefined;
    const scores = clothTypeRes.json?.scores as number[] | undefined;

    let topCloth = "outfit";
    let conf = 0.4;

    if (Array.isArray(labels) && Array.isArray(scores) && labels.length > 0) {
      topCloth = labels[0];
      conf = clamp01(scores[0]);
    }

    const category = mapToCategory(topCloth);
    const { bestOccasions, avoidOccasions } = suggestOccasions(category, topCloth);

    return NextResponse.json({
      clothType: topCloth,
      category,
      bestOccasions,
      avoidOccasions,
      confidence: conf,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "server error" },
      { status: 500 }
    );
  }
}
