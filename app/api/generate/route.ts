import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

import { generateTopOutfits } from "@/src/ai/outfits/outfitBuilder";
import type { OccasionKey } from "@/src/ai/outfits/occasionPsychology";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const uid = String(body.uid || "");
    const occasion = String(body.occasion || "") as OccasionKey;

    if (!uid || !occasion) {
      return NextResponse.json(
        { error: "uid and occasion required" },
        { status: 400 }
      );
    }

    const ref = collection(db, "users", uid, "wardrobe");
    const snap = await getDocs(ref);

    const wardrobe = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    if (!wardrobe.length) {
      return NextResponse.json(
        { error: "No wardrobe items found." },
        { status: 400 }
      );
    }

    const generated = generateTopOutfits({
      occasion,
      wardrobe: wardrobe as any,
    });

    return NextResponse.json({
      ok: true,

      // ✅ REMOVE occasionProfile completely
      occasion,

      outfits: generated.outfits.map((o) => ({
        styleMode: o.styleMode,
        score: o.score,
        reasons: o.reasons,
        warnings: o.warnings,
        breakdown: o.breakdown,
        items: {
          top: o.pick.top?.id ?? null,
          bottom: o.pick.bottom?.id ?? null,
          shoes: o.pick.shoes?.id ?? null,
          outer: o.pick.outer?.id ?? null,
          accessory: o.pick.accessory?.id ?? null,
        },
      })),
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Outfit generation failed" },
      { status: 500 }
    );
  }
}
