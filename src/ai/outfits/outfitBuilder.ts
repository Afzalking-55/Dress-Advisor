import { OCCASIONS, type OccasionKey } from "./occasionPsychology";
import type { WardrobeItem, OutfitPick } from "./outfitScorer";
import { scoreOutfit } from "./outfitScorer";
import type { TasteProfile } from "./tasteProfile";
import { personalizationBoost } from "./tasteProfile";

/* ----------------------------- helpers ----------------------------- */

const toLower = (x: any) => String(x || "").trim().toLowerCase();

type Category = "top" | "bottom" | "shoes" | "outer" | "accessory" | "other";

/**
 * 🔒 Deterministic category resolver (single source of truth)
 */
function resolveCategory(item: WardrobeItem): Category {
  const text = [
    (item as any)?.aiNormalized?.attributes?.category,
    (item as any)?.category,
    (item as any)?.clothType,
    (item as any)?.aiName,
  ]
    .map(toLower)
    .join(" ");

  if (/(shoe|sneaker|boot|loafer|heel|sandal|footwear)/.test(text)) return "shoes";
  if (/(pant|pants|jean|trouser|short|skirt|legging|cargo)/.test(text)) return "bottom";
  if (/(jacket|coat|blazer|hoodie|outer)/.test(text)) return "outer";
  if (/(watch|belt|chain|bracelet|accessory)/.test(text)) return "accessory";
  if (/(shirt|tshirt|t-shirt|top|sweater|kurta)/.test(text)) return "top";

  return "other";
}

const notSame = (a?: WardrobeItem, b?: WardrobeItem) =>
  !a || !b || String(a.id) !== String(b.id);

const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

/* ----------------------------- types ----------------------------- */

export type GeneratedOutfit = {
  pick: OutfitPick;
  score: number;
  reasons: string[];
  warnings: string[];
  breakdown: Record<string, number>;
  styleMode: "safe" | "attraction" | "statement";
  personalization: {
    boost: number;
    reasons: string[];
    penalties: string[];
  } | null;
};

export type GenerateOutfitsResult = {
  occasion: OccasionKey;
  outfits: GeneratedOutfit[];
};

/* ----------------------------- main builder ----------------------------- */

export function generateTopOutfits(params: {
  occasion: OccasionKey;
  wardrobe: WardrobeItem[];
  maxCombos?: number;
  tasteProfile?: TasteProfile | null;
}): GenerateOutfitsResult {
  const { occasion, wardrobe, maxCombos = 1200, tasteProfile } = params;

  const profile = OCCASIONS[occasion];
  if (!profile) {
    return { occasion, outfits: [] };
  }

  const items = (wardrobe || []).filter(Boolean);

  // Index for personalization
  const wardrobeIndex = new Map<string, WardrobeItem>();
  items.forEach((w) => wardrobeIndex.set(w.id, w));

  // Categorize
  const byCat: Record<Category, WardrobeItem[]> = {
    top: [],
    bottom: [],
    shoes: [],
    outer: [],
    accessory: [],
    other: [],
  };

  for (const it of items) {
    byCat[resolveCategory(it)].push(it);
  }

  const tops = byCat.top.length ? byCat.top : byCat.other;
  const bottoms = byCat.bottom.length ? byCat.bottom : byCat.other;
  const shoes = byCat.shoes;
  const outers = byCat.outer;
  const accessories = byCat.accessory;

  const combos: OutfitPick[] = [];

  for (const t of shuffle(tops).slice(0, 40)) {
    for (const b of shuffle(bottoms).slice(0, 40)) {
      if (!notSame(t, b)) continue;

      if (shoes.length) {
        for (const s of shuffle(shoes).slice(0, 20)) {
          if (!notSame(t, s) || !notSame(b, s)) continue;

          const o = shuffle(outers)[0];
          const a = shuffle(accessories)[0];

          combos.push({
            top: t,
            bottom: b,
            shoes: s,
            outer: o && notSame(o, t) && notSame(o, b) && notSame(o, s) ? o : undefined,
            accessory:
              a && notSame(a, t) && notSame(a, b) && notSame(a, s) ? a : undefined,
          });

          if (combos.length >= maxCombos) break;
        }
      } else {
        combos.push({ top: t, bottom: b });
      }

      if (combos.length >= maxCombos) break;
    }
    if (combos.length >= maxCombos) break;
  }

  if (!combos.length && tops[0] && bottoms[0]) {
    combos.push({ top: tops[0], bottom: bottoms[0] });
  }

  const modes: GeneratedOutfit["styleMode"][] = ["safe", "attraction", "statement"];
  const results: GeneratedOutfit[] = [];

  for (const mode of modes) {
    const scored = combos
      .map((pick) => {
        let baseScore = 0;
        let reasons: string[] = [];
        let warnings: string[] = [];
        let breakdown: Record<string, number> = {};

        try {
          const res = scoreOutfit(profile, pick);
          baseScore = res.score;
          reasons = res.reasons || [];
          warnings = res.warnings || [];
          breakdown = res.breakdown || {};
        } catch {
          baseScore = 0.2;
        }

        let pData = null;
        let pBoost = 0;

        if (tasteProfile) {
          try {
            const pb = personalizationBoost({
              profile: tasteProfile,
              occasion,
              pick,
              wardrobeIndex,
            });
            pBoost = pb.boost;
            pData = pb;
          } catch {
            pBoost = 0;
          }
        }

        const total = Math.min(1, Math.max(0, baseScore + pBoost));

        return {
          pick,
          score: total,
          reasons,
          warnings,
          breakdown,
          styleMode: mode,
          personalization: pData,
        };
      })
      .sort((a, b) => b.score - a.score);

    if (scored[0]) results.push(scored[0]);
  }

  while (results.length < 3 && combos.length) {
    const pick = combos.shift()!;
    const res = scoreOutfit(profile, pick);
    results.push({
      pick,
      score: res.score,
      reasons: res.reasons,
      warnings: res.warnings,
      breakdown: res.breakdown,
      styleMode: "safe",
      personalization: null,
    });
  }

  return {
    occasion,
    outfits: results.slice(0, 3),
  };
}
