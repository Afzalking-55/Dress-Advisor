import { NextResponse } from "next/server";
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

import type { OccasionKey } from "@/src/ai/outfits/occasionPsychology";
import {
  emptyTasteProfile,
  updateTasteFromRating,
} from "@/src/ai/outfits/tasteProfile";

export const runtime = "nodejs";

/**
 * POST body:
 * {
 *  uid: string,
 *  occasion: OccasionKey,
 *  outfit: { top?: string, bottom?: string, shoes?: string, outer?: string, accessory?: string },
 *  rating: 1..5,
 *  source?: "outfits" | "chat" | "testing"
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const uid = String(body?.uid || "").trim();
    const occasion = body?.occasion as OccasionKey;
    const outfit = (body?.outfit || {}) as Record<string, string | undefined>;
    const rating = Number(body?.rating);
    const source = (body?.source || "outfits") as string;

    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    if (!occasion) return NextResponse.json({ error: "Missing occasion" }, { status: 400 });
    if (!outfit || typeof outfit !== "object")
      return NextResponse.json({ error: "Missing outfit" }, { status: 400 });

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating (1..5)" }, { status: 400 });
    }

    const tasteRef = doc(db, "users", uid, "ai", "tasteProfile");
    const snap = await getDoc(tasteRef);

    const prev = snap.exists() ? snap.data() : null;
    const currentTaste = (prev?.profile ?? emptyTasteProfile()) as any;
    const currentVersion = Number(prev?.tasteVersion ?? 0);

    // ---------------------------------------------------------
    // ✅ Signature-safe call for updateTasteFromRating
    // Some versions expect: updateTasteFromRating({ prev, occasion, outfit, rating })
    // Others expect: updateTasteFromRating(prev, occasion, outfit, rating)
    // ---------------------------------------------------------
    let updated: any;

    try {
      // Try object-signature first (most robust)
      updated = (updateTasteFromRating as any)({
        prev: currentTaste,
        occasion,
        outfit,
        rating,
      });
    } catch {
      // fallback to old signature
      updated = (updateTasteFromRating as any)(currentTaste, occasion, outfit, rating);
    }

    // ✅ tasteVersion increments with every update
    const nextVersion = currentVersion + 1;

    await setDoc(
      tasteRef,
      {
        profile: updated,
        tasteVersion: nextVersion,
        updatedAt: Date.now(),
        lastRating: {
          occasion,
          rating,
          outfit,
          source,
          at: Date.now(),
        },
      },
      { merge: true }
    );

    // ✅ Optional: store an event log (super useful later)
    // This enables "training history", analytics, replaying, etc.
    try {
      const logRef = collection(db, "users", uid, "ai", "tasteEvents");
      await addDoc(logRef, {
        occasion,
        rating,
        outfit,
        source,
        tasteVersion: nextVersion,
        at: Date.now(),
      });
    } catch {
      // ignore log failures
    }

    // ✅ return deltas so frontend can show "learning toast"
    const topColors = Object.entries(updated?.colorPrefs || {})
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 6);

    const topTags = Object.entries(updated?.tagPrefs || {})
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 10);

    // ✅ small summary for UI
    const changedSummary =
      rating >= 4
        ? "Nice — locked in more of this style."
        : rating <= 2
        ? "Got it — reducing outfits like this."
        : "Noted — adjusting slightly.";

    // ✅ send tiny snapshot for debug + UI (not huge)
    const newTasteSnapshot = {
      tasteVersion: nextVersion,
      topTags: topTags.slice(0, 5).map(([k]) => k),
      topColors: topColors.slice(0, 5).map(([k]) => k),
    };

    return NextResponse.json({
      ok: true,
      tasteVersion: nextVersion,
      changedSummary,
      updated: {
        topColors,
        topTags,
      },
      snapshot: newTasteSnapshot,
    });
  } catch (err: any) {
    console.error("OUTFITS RATE ERROR:", err);
    return NextResponse.json(
      { error: "Rating failed", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
