import { NextResponse } from "next/server";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

import { generateTopOutfits } from "@/src/ai/outfits/outfitBuilder";
import {
  inferIntentFromMessage,
  buildStylistResponseText,
} from "@/src/ai/outfits/chatStylist";
import type { OccasionKey } from "@/src/ai/outfits/occasionPsychology";
import { OCCASIONS } from "@/src/ai/outfits/occasionPsychology";
import type { TasteProfile } from "@/src/ai/outfits/tasteProfile";

export const runtime = "nodejs";

/** ----------------------- Memory Types ----------------------- */
export type StylistMemory = {
  occasion?: OccasionKey;

  avoidColors?: string[];
  preferColors?: string[];

  banItems?: string[]; // item ids banned by user
  forceMode?: "safe" | "attraction" | "statement" | null;

  formalityDelta?: number; // -1..+1 future use
};

function normalizeColor(x: string) {
  return String(x || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function mergeUnique(a: string[] = [], b: string[] = []) {
  const set = new Set([...a, ...b].map(normalizeColor));
  return [...set].filter(Boolean);
}

/** ✅ Safe Occasion fallback (fixes casual bug) */
function safeOccasion(x: any): OccasionKey {
  const key = String(x || "").trim();

  // ✅ if already a valid key
  if (key && key in OCCASIONS) return key as OccasionKey;

  // ✅ soft mapping for generic words
  const m = key.toLowerCase();

  if (m === "casual") return "casual_hangout";
  if (m.includes("hang")) return "casual_hangout";
  if (m.includes("college")) return "college";
  if (m.includes("office") || m.includes("work")) return "office";
  if (m.includes("wedding")) return "wedding_guest";
  if (m.includes("party")) return "party";
  if (m.includes("club")) return "club_night";
  if (m.includes("interview")) return "interview";
  if (m.includes("gym")) return "gym";
  if (m.includes("travel")) return "travel";
  if (m.includes("street")) return "streetwear";

  // ✅ default fallback
  return "casual_hangout";
}

/** ✅ detect simple follow-up preferences from user message */
function extractMemoryUpdates(message: string): Partial<StylistMemory> {
  const m = message.toLowerCase();

  const avoidColors: string[] = [];
  const preferColors: string[] = [];
  const banItems: string[] = [];

  // ---------- avoid colors ----------
  if (m.includes("no red") || m.includes("avoid red")) avoidColors.push("red");
  if (m.includes("no black") || m.includes("avoid black")) avoidColors.push("black");
  if (m.includes("no white") || m.includes("avoid white")) avoidColors.push("white");
  if (m.includes("no blue") || m.includes("avoid blue")) avoidColors.push("blue");
  if (m.includes("no green") || m.includes("avoid green")) avoidColors.push("green");

  // ---------- prefer colors ----------
  if (m.includes("more black") || m.includes("prefer black")) preferColors.push("black");
  if (m.includes("more white") || m.includes("prefer white")) preferColors.push("white");
  if (m.includes("more blue") || m.includes("prefer blue")) preferColors.push("blue");
  if (m.includes("more red") || m.includes("prefer red")) preferColors.push("red");

  // ---------- force mode ----------
  let forceMode: StylistMemory["forceMode"] = null;
  if (m.includes("safe")) forceMode = "safe";
  if (m.includes("attraction")) forceMode = "attraction";
  if (m.includes("statement")) forceMode = "statement";

  // ---------- formality adjustment ----------
  let formalityDelta = 0;
  if (m.includes("more formal") || m.includes("more premium") || m.includes("more classy"))
    formalityDelta += 0.15;

  if (m.includes("more casual") || m.includes("less formal") || m.includes("relaxed"))
    formalityDelta -= 0.15;

  const out: Partial<StylistMemory> = {};

  if (avoidColors.length) out.avoidColors = avoidColors;
  if (preferColors.length) out.preferColors = preferColors;
  if (banItems.length) out.banItems = banItems;

  if (forceMode) out.forceMode = forceMode;
  if (formalityDelta !== 0) out.formalityDelta = formalityDelta;

  return out;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const uid = String(body.uid || "");
    const message = String(body.message || "");
    const memoryIn = (body.memory || {}) as StylistMemory;

    if (!uid || !message) {
      return NextResponse.json({ error: "uid and message required" }, { status: 400 });
    }

    // infer intent
    const intent = inferIntentFromMessage(message);

    // ✅ FIXED: never return "casual"
    const occasion: OccasionKey = safeOccasion(
      intent?.occasion || memoryIn.occasion || "casual_hangout"
    );

    // wardrobe
    const wardrobeRef = collection(db, "users", uid, "wardrobe");
    const wardrobeSnap = await getDocs(wardrobeRef);

    let wardrobe = wardrobeSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    if (!wardrobe.length) {
      return NextResponse.json(
        { error: "No wardrobe items found. Upload items first." },
        { status: 400 }
      );
    }

    // taste profile
    const profileRef = doc(db, "users", uid, "ai", "profile");
    const profileSnap = await getDoc(profileRef);

    const tasteProfile = profileSnap.exists()
      ? (profileSnap.data() as TasteProfile)
      : null;

    // merge memory updates from message
    const updates = extractMemoryUpdates(message);

    const memory: StylistMemory = {
      occasion,

      avoidColors: mergeUnique(memoryIn.avoidColors, updates.avoidColors),
      preferColors: mergeUnique(memoryIn.preferColors, updates.preferColors),
      banItems: mergeUnique(memoryIn.banItems, updates.banItems),

      forceMode: updates.forceMode ?? memoryIn.forceMode ?? null,

      formalityDelta: (memoryIn.formalityDelta || 0) + (updates.formalityDelta || 0),
    };

    // ✅ apply memory bans
    if (memory.banItems?.length) {
      const bannedSet = new Set(memory.banItems.map(String));
      wardrobe = wardrobe.map((w: any) =>
        bannedSet.has(String(w.id)) ? { ...w, banned: true } : w
      );
    }

    // ✅ apply avoidColors bans
    if (memory.avoidColors?.length) {
      wardrobe = wardrobe.map((w: any) => {
        const colors: string[] = Array.isArray(w?.aiNormalized?.attributes?.colors)
          ? w.aiNormalized.attributes.colors.map((x: string) => normalizeColor(x))
          : [];

        const hit = colors.some((c) => memory.avoidColors!.includes(normalizeColor(c)));

        return hit ? { ...w, banned: true } : w;
      });
    }

    // generate outfits
    const generated = generateTopOutfits({
      occasion,
      wardrobe: wardrobe as any,
      tasteProfile,
    });

    // if user forced a mode, reorder outfits so that mode becomes #1
    let outfits = generated.outfits;

    if (memory.forceMode) {
      outfits = [...generated.outfits].sort((a, b) => {
        if (a.styleMode === memory.forceMode) return -1;
        if (b.styleMode === memory.forceMode) return 1;
        return b.score - a.score;
      });
    }

    // response text
    const text = buildStylistResponseText({ occasion, tone: intent.tone });

    return NextResponse.json({
      ok: true,
      intent: {
        ...intent,
        occasion,
      },
      memory,
      assistant: {
        intro: text.intro,
        psychology: text.psychology,
        personalized: !!tasteProfile,
        outfits: outfits.map((o) => ({
          title:
            o.styleMode === "safe"
              ? "✅ Safe Win"
              : o.styleMode === "attraction"
              ? "🔥 Attraction Max"
              : "⚡ Statement Fit",

          styleMode: o.styleMode,
          score: o.score,
          reasons: o.reasons,
          warnings: o.warnings,
          personalization: o.personalization || null,

          items: {
            top: o.pick.top?.id || null,
            bottom: o.pick.bottom?.id || null,
            shoes: o.pick.shoes?.id || null,
            outer: o.pick.outer?.id || null,
            accessory: o.pick.accessory?.id || null,
          },
        })),
      },
    });
  } catch (err: any) {
    console.error("OUTFITS CHAT V2 ERROR:", err);
    return NextResponse.json(
      { error: "Chat stylist failed", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
