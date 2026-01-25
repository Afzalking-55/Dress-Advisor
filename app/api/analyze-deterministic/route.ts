import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import crypto from "crypto";

export const runtime = "nodejs"; // ✅ important for crypto + fetch

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function safeNumber(n: any, fallback = 0.75) {
  const v = Number(n);
  if (Number.isFinite(v)) return v;
  return fallback;
}

/** -----------------------------------------------
 * ✅ downloads cloudinary URL -> sends as multipart file to AI backend
 * ----------------------------------------------- */
async function callProcessMultiFromUrl(imageUrl: string) {
  const imgRes = await fetch(imageUrl, {
    headers: {
      "User-Agent": "DressAI/1.0",
    },
  });

  if (!imgRes.ok) {
    throw new Error(`Failed to download image (${imgRes.status})`);
  }

  const arrayBuffer = await imgRes.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: "image/jpeg" });

  const form = new FormData();
  form.append("file", blob, "wardrobe.jpg");

  const res = await fetch("http://127.0.0.1:8001/api/process/multi", {
    method: "POST",
    body: form,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "AI backend failed");

  return data;
}

/** -----------------------------------------------
 * ✅ category mapper for outfit engine
 * returns: top | bottom | shoes | outer | accessory | other
 * ----------------------------------------------- */
function mapToAiCategory(label: string): string {
  const l = String(label || "").toLowerCase();

  // shoes
  if (
    l.includes("shoe") ||
    l.includes("sneaker") ||
    l.includes("boot") ||
    l.includes("loafer") ||
    l.includes("heel") ||
    l.includes("sandal") ||
    l.includes("flipflop") ||
    l.includes("slipper")
  )
    return "shoes";

  // bottom
  if (
    l.includes("pant") ||
    l.includes("jean") ||
    l.includes("trouser") ||
    l.includes("bottom") ||
    l.includes("short") ||
    l.includes("skirt") ||
    l.includes("legging") ||
    l.includes("cargo") ||
    l.includes("chino")
  )
    return "bottom";

  // outer
  if (
    l.includes("jacket") ||
    l.includes("hoodie") ||
    l.includes("coat") ||
    l.includes("blazer") ||
    l.includes("sweater") ||
    l.includes("outer") ||
    l.includes("cardigan")
  )
    return "outer";

  // accessory
  if (
    l.includes("watch") ||
    l.includes("belt") ||
    l.includes("cap") ||
    l.includes("hat") ||
    l.includes("ring") ||
    l.includes("bracelet") ||
    l.includes("accessory")
  )
    return "accessory";

  // top
  if (
    l.includes("shirt") ||
    l.includes("t-shirt") ||
    l.includes("tshirt") ||
    l.includes("tee") ||
    l.includes("top") ||
    l.includes("kurta") ||
    l.includes("suit") ||
    l.includes("blouse")
  )
    return "top";

  return "other";
}

/** -----------------------------------------------
 * ✅ infer formality for scoring 0..1
 * ----------------------------------------------- */
function inferFormality(label: string, cat: string): number {
  const l = String(label || "").toLowerCase();

  // super formal
  if (l.includes("suit") || l.includes("blazer")) return 0.92;
  if (l.includes("formal") || l.includes("shirt")) return 0.75;

  // office medium
  if (l.includes("kurta")) return 0.65;

  // casual
  if (l.includes("hoodie") || l.includes("tshirt") || l.includes("t-shirt"))
    return 0.35;

  // shoes
  if (cat === "shoes") {
    if (l.includes("loafer") || l.includes("heel")) return 0.72;
    if (l.includes("sneaker")) return 0.35;
  }

  // bottoms
  if (cat === "bottom") {
    if (l.includes("jeans")) return 0.42;
    if (l.includes("trouser")) return 0.68;
  }

  return 0.5;
}

/** -----------------------------------------------
 * ✅ infer style tags for psychology engine
 * ----------------------------------------------- */
function inferStyleTags(label: string, cat: string): string[] {
  const l = String(label || "").toLowerCase();
  const tags = new Set<string>();

  // universal vibes
  tags.add("clean");

  if (l.includes("formal") || l.includes("blazer") || l.includes("suit"))
    tags.add("professional");
  if (l.includes("street") || l.includes("oversized")) tags.add("streetwear");
  if (l.includes("sport") || l.includes("gym")) tags.add("sporty");
  if (l.includes("premium") || l.includes("blazer") || l.includes("coat"))
    tags.add("premium");
  if (l.includes("party") || l.includes("club")) tags.add("bold");

  // category-specific defaults
  if (cat === "top") tags.add("top");
  if (cat === "bottom") tags.add("bottom");
  if (cat === "shoes") tags.add("footwear");
  if (cat === "outer") tags.add("outer");

  return Array.from(tags);
}

/** -----------------------------------------------
 * ✅ Determine Season (simple)
 * ----------------------------------------------- */
function inferSeason(label: string): string[] {
  const l = String(label || "").toLowerCase();
  if (l.includes("coat") || l.includes("hoodie") || l.includes("sweater"))
    return ["winter"];
  if (l.includes("short") || l.includes("tee") || l.includes("tshirt"))
    return ["summer"];
  return ["all"];
}

/** -----------------------------------------------
 * ✅ Convert backend output -> Firestore-safe + outfit-engine-ready object
 * ----------------------------------------------- */
function shrinkAndNormalize(raw: any) {
  const cards = Array.isArray(raw?.wardrobeCards) ? raw.wardrobeCards : [];

  const clothCards = cards.filter(
    (c: any) => String(c?.label || "").toLowerCase() !== "person"
  );

  const top = clothCards[0] || null;

  const topLabel = String(top?.label || "outfit");
  const topConfidence = safeNumber(top?.confidence ?? 0.75, 0.75);

  // ✅ normalize
  const aiCategory = mapToAiCategory(topLabel);
  const formality = inferFormality(topLabel, aiCategory);
  const styleTags = inferStyleTags(topLabel, aiCategory);
  const season = inferSeason(topLabel);

  const colors: string[] =
    Array.isArray(raw?.colors) && raw.colors.length
      ? raw.colors.map((x: any) => String(x).toLowerCase())
      : [];

  return {
    // raw preview (small)
    analysis: {
      wardrobeCards: clothCards.slice(0, 3).map((c: any) => ({
        label: c.label,
        confidence: c.confidence,
        bbox: c.bbox,
      })),
      topLabel,
      topConfidence,
      meta: {
        model: raw?.model || "unknown",
        version: raw?.version || "v1",
      },
    },

    // ✅ outfit-engine-ready normalized structure
    aiNormalized: {
      topLabel,
      topConfidence,
      attributes: {
        category: aiCategory,
        colors,
        pattern: raw?.pattern || null,
        material: raw?.material || null,
        season,
        formality,
        styleTags,
      },
    },

    // ✅ auto naming
    inferred: {
      aiCategory,
      formality,
      styleTags,
      season,
      colors,
    },
  };
}

/**
 * POST body: { uid, itemId, imageUrl }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const uid = String(body.uid || "");
    const itemId = String(body.itemId || "");
    const imageUrl = String(body.imageUrl || "");

    if (!uid || !itemId || !imageUrl) {
      return NextResponse.json(
        { error: "uid, itemId, imageUrl required" },
        { status: 400 }
      );
    }

    const ref = doc(db, "users", uid, "wardrobe", itemId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return NextResponse.json(
        { error: "Wardrobe item not found" },
        { status: 404 }
      );
    }

    const item = snap.data() as any;
    const analysisHash = sha256(imageUrl);

    // ✅ Cached response
    if (item.analysisHash === analysisHash && item.analysis && item.aiNormalized) {
      return NextResponse.json({
        ok: true,
        cached: true,
        analysis: item.analysis,
        aiNormalized: item.aiNormalized,
        analysisConfidence: item.analysisConfidence ?? 0.75,
        aiVersion: item.analysisVersion ?? "v2.0",
      });
    }

    // ✅ Run AI
    const raw = await callProcessMultiFromUrl(imageUrl);

    const { analysis, aiNormalized, inferred } = shrinkAndNormalize(raw);

    const analysisConfidence = safeNumber(
      analysis?.topConfidence ?? raw?.confidence ?? raw?.wardrobeCards?.[0]?.confidence,
      0.75
    );

    const topLabel = String(aiNormalized?.topLabel || "outfit");
    const aiCategory = String(aiNormalized?.attributes?.category || "other");

    // ✅ Better auto item naming
    const colorFallback =
      Array.isArray(aiNormalized?.attributes?.colors) && aiNormalized.attributes.colors.length
        ? aiNormalized.attributes.colors[0]
        : "";

    const betterName = `${colorFallback ? `${colorFallback} ` : ""}${topLabel}`
      .replace(/\s+/g, " ")
      .trim();

    await updateDoc(ref, {
      analysis,
      aiNormalized,
      analysisHash,
      analysisConfidence,
      analysisVersion: "v2.0",
      analysisUpdatedAt: Date.now(),

      // ✅ auto fill legacy fields (still kept)
      clothType: topLabel,
      confidence: Math.round(analysisConfidence * 100),

      // ✅ keep UI item naming improved
      aiName: betterName || item.aiName || topLabel,

      updatedAt: Date.now(),
    });

    return NextResponse.json({
      ok: true,
      cached: false,
      analysis,
      aiNormalized,
      inferred,
      analysisConfidence,
      aiVersion: "v2.0",
    });
  } catch (err: any) {
    console.error("ANALYZE DETERMINISTIC ERROR:", err);
    return NextResponse.json(
      {
        error: "Analyze deterministic failed",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
