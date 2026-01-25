import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * This route now calls your OWN Python AI backend:
 *   POST http://127.0.0.1:8000/predict
 *
 * And returns the format your Upload page expects:
 * {
 *  clothType?: string;
 *  category?: "Top"|"Bottom"|"Shoes"|"Other";
 *  bestOccasions?: string[];
 *  avoidOccasions?: string[];
 *  confidence?: number; // 0..1
 * }
 */

type Category = "Top" | "Bottom" | "Shoes" | "Other";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function normalize(s: string) {
  return (s || "").toLowerCase().trim();
}

function mapToCategoryFromClothType(clothType: string): Category {
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

function suggestOccasions(category: Category, clothType: string) {
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

function base64ToBuffer(imageBase64: string) {
  const base64Data = imageBase64.split(",").pop() || "";
  return Buffer.from(base64Data, "base64");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const imageBase64: string | undefined = body?.imageBase64;

    if (!imageBase64) {
      return NextResponse.json(
        { ok: false, error: "imageBase64 missing" },
        { status: 400 }
      );
    }

    // ✅ Convert base64 -> binary -> FormData (what python expects)
    const buffer = base64ToBuffer(imageBase64);

    const form = new FormData();
    form.append("file", new Blob([buffer], { type: "image/jpeg" }), "image.jpg");

    // ✅ Call your own python AI
    const pyRes = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      body: form,
    });

    const pyText = await pyRes.text();
    let pyJson: any = null;

    try {
      pyJson = JSON.parse(pyText);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Python returned non-JSON", raw: pyText },
        { status: 500 }
      );
    }

    if (!pyRes.ok) {
      return NextResponse.json(
        { ok: false, error: pyJson?.error || "Python AI failed", raw: pyJson },
        { status: 500 }
      );
    }

    /**
     * ✅ Our python returns:
     * {
     *  clothType: "jeans",
     *  category: "Bottom",
     *  bestOccasions: [...],
     *  avoidOccasions: [...],
     *  confidence: 0.72,
     *  detections: [...]
     * }
     */
    const clothType =
      typeof pyJson?.clothType === "string" ? pyJson.clothType : "outfit";

    const confidence =
      typeof pyJson?.confidence === "number"
        ? clamp01(pyJson.confidence)
        : 0.35;

    let category: Category =
      pyJson?.category === "Top" ||
      pyJson?.category === "Bottom" ||
      pyJson?.category === "Shoes" ||
      pyJson?.category === "Other"
        ? pyJson.category
        : mapToCategoryFromClothType(clothType);

    const bestOccasions: string[] = Array.isArray(pyJson?.bestOccasions)
      ? pyJson.bestOccasions
      : suggestOccasions(category, clothType).bestOccasions;

    const avoidOccasions: string[] = Array.isArray(pyJson?.avoidOccasions)
      ? pyJson.avoidOccasions
      : suggestOccasions(category, clothType).avoidOccasions;

    // ✅ Return exactly what upload page expects
    return NextResponse.json({
      clothType,
      category,
      bestOccasions,
      avoidOccasions,
      confidence,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "server error" },
      { status: 500 }
    );
  }
}
