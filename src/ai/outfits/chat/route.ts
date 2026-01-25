import { NextResponse } from "next/server";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

import {
  generateTopOutfits,
  type GeneratedOutfit,
} from "@/src/ai/outfits/outfitBuilder";
import {
  inferIntentFromMessage,
  buildStylistResponseText,
} from "@/src/ai/outfits/chatStylist";
import type { OccasionKey } from "@/src/ai/outfits/occasionPsychology";
import type { TasteProfile } from "@/src/ai/outfits/tasteProfile";

export const runtime = "nodejs";

/* ----------------------------- helpers ----------------------------- */

const makeRequestId = () =>
  `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;

function serializeItem(it: any) {
  if (!it) return null;

  return {
    id: it.id,
    imageUrl: it.imageUrl || null,
    category:
      it.aiNormalized?.attributes?.category ||
      it.category ||
      it.clothType ||
      null,
    color: it.colorName || it.aiNormalized?.attributes?.color || null,
    tags: it.aiNormalized?.tags || [],
  };
}

/* ----------------------------- route ----------------------------- */

export async function POST(req: Request) {
  const requestId = makeRequestId();

  try {
    const body = await req.json().catch(() => ({}));

    const uid = String(body.uid || "").trim();
    const message = String(body.message || "").trim();

    if (!uid || !message) {
      return NextResponse.json(
        { error: "uid and message required", requestId },
        { status: 400 }
      );
    }

    /* -------- 1) infer intent -------- */
    const intent = inferIntentFromMessage(message);
    const occasion = (intent.occasion || "casual") as OccasionKey;

    /* -------- 2) fetch wardrobe -------- */
    const wardrobeSnap = await getDocs(collection(db, "users", uid, "wardrobe"));
    const wardrobe = wardrobeSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    if (!wardrobe.length) {
      return NextResponse.json(
        {
          error: "No wardrobe items found. Upload items first.",
          requestId,
        },
        { status: 400 }
      );
    }

    /* -------- 3) fetch taste profile -------- */
    const tasteRef = doc(db, "users", uid, "ai", "tasteProfile");
    const tasteSnap = await getDoc(tasteRef);

    const tasteProfile = (tasteSnap.exists()
      ? tasteSnap.data()?.profile
      : null) as TasteProfile | null;

    const tasteVersion = Number(
      tasteSnap.exists() ? tasteSnap.data()?.tasteVersion ?? 0 : 0
    );

    /* -------- 4) generate outfits (AI core) -------- */
    const generated = generateTopOutfits({
      occasion,
      wardrobe: wardrobe as any,
      tasteProfile,
    });

    const outfits: GeneratedOutfit[] = generated.outfits || [];

    /* -------- 5) stylist text (FIXED — no outfits passed) -------- */
    const stylist = buildStylistResponseText({
      occasion,
      tone: intent.tone,
    });

    /* -------- 6) response -------- */
    return NextResponse.json({
      ok: true,
      requestId,
      uid,
      occasion,
      tasteVersion,
      intent,

      assistant: {
        intro: stylist.intro,
        psychology: stylist.psychology,

        outfits: outfits.map((o) => ({
          title:
            o.styleMode === "safe"
              ? "✅ Safe Win"
              : o.styleMode === "attraction"
              ? "🔥 Attraction Max"
              : "⚡ Statement Fit",

          styleMode: o.styleMode,
          score: o.score,
          confidence: Math.min(1, Math.max(0.2, o.score + 0.15)),
          reasons: o.reasons,
          warnings: o.warnings,
          personalization: o.personalization,

          items: {
            top: serializeItem(o.pick.top),
            bottom: serializeItem(o.pick.bottom),
            shoes: serializeItem(o.pick.shoes),
            outer: serializeItem(o.pick.outer),
            accessory: serializeItem(o.pick.accessory),
          },
        })),
      },
    });
  } catch (err: any) {
    console.error("OUTFITS CHAT ERROR:", err, { requestId });
    return NextResponse.json(
      {
        error: "Chat stylist failed",
        details: err?.message || String(err),
        requestId,
      },
      { status: 500 }
    );
  }
}
