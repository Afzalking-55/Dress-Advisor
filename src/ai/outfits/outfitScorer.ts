import type { OccasionProfile } from "./occasionPsychology";

export type WardrobeItem = {
  id: string;

  // legacy + firestore fields
  clothType?: string;
  confidence?: number; // 0-100 legacy
  aiName?: string;
  colorName?: string;
  category?: string;
  imageUrl?: string;

  aiNormalized?: {
    topLabel?: string;
    topConfidence?: number;
    attributes?: {
      category?: string | null;
      colors?: string[];
      pattern?: string | null;
      material?: string | null;
      season?: string[];
      formality?: number; // 0..1
      styleTags?: string[];
    };
  };

  lastWornAt?: number;
  banned?: boolean;
};

export type OutfitPick = {
  top?: WardrobeItem;
  bottom?: WardrobeItem;
  shoes?: WardrobeItem;
  outer?: WardrobeItem;
  accessory?: WardrobeItem;
};

export type OutfitScoreResult = {
  score: number; // 0..1
  reasons: string[];
  warnings: string[];
  breakdown: Record<string, number>;
};

function clamp01(x: number) {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function normalizeColor(c: string) {
  return String(c || "").trim().toLowerCase();
}

function uniq(arr: string[]) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}

function intersectionScore(a: string[], b: string[]) {
  if (!a?.length || !b?.length) return 0;
  const setB = new Set(b.map(normalizeColor));
  let hit = 0;
  for (const x of a) if (setB.has(normalizeColor(x))) hit++;
  return hit / Math.max(1, Math.min(a.length, b.length));
}

function getItemFormality(item: WardrobeItem): number {
  const v = item?.aiNormalized?.attributes?.formality;
  if (typeof v === "number" && Number.isFinite(v)) return clamp01(v);

  // ✅ fallback heuristic if metadata missing
  const cat =
    String(item?.aiNormalized?.attributes?.category || item?.category || "").toLowerCase();
  const type = String(item?.clothType || item?.aiNormalized?.topLabel || "").toLowerCase();
  const name = String(item?.aiName || "").toLowerCase();

  const joined = `${cat} ${type} ${name}`;

  // basic guess
  if (joined.includes("blazer") || joined.includes("suit")) return 0.92;
  if (joined.includes("formal") || joined.includes("shirt")) return 0.72;
  if (joined.includes("jeans") || joined.includes("cargo")) return 0.45;
  if (joined.includes("tshirt") || joined.includes("t-shirt")) return 0.38;
  if (joined.includes("short")) return 0.25;

  return 0.5;
}

function getItemTags(item: WardrobeItem): string[] {
  const tags = item?.aiNormalized?.attributes?.styleTags;
  if (Array.isArray(tags) && tags.length) return tags.map((t) => String(t).toLowerCase());

  // ✅ fallback tags
  const cat =
    String(item?.aiNormalized?.attributes?.category || item?.category || "").toLowerCase();
  const type = String(item?.clothType || item?.aiNormalized?.topLabel || "").toLowerCase();
  const name = String(item?.aiName || "").toLowerCase();

  const joined = `${cat} ${type} ${name}`;

  const out: string[] = [];
  if (joined.includes("formal") || joined.includes("shirt") || joined.includes("blazer"))
    out.push("formal", "classic");
  if (joined.includes("tshirt") || joined.includes("hoodie") || joined.includes("sneaker"))
    out.push("casual", "street");
  if (joined.includes("kurta") || joined.includes("ethnic")) out.push("ethnic");
  if (joined.includes("jeans")) out.push("casual");
  if (joined.includes("black") || joined.includes("white")) out.push("minimal");

  return uniq(out);
}

function getItemColors(item: WardrobeItem): string[] {
  const colors = item?.aiNormalized?.attributes?.colors;
  if (Array.isArray(colors) && colors.length) return colors.map(normalizeColor);

  // ✅ fallback to saved colorName
  const c = normalizeColor((item as any)?.colorName || "");
  return c ? [c] : [];
}

function freshnessPenalty(item: WardrobeItem): number {
  const last = item?.lastWornAt;
  if (!last) return 0;

  const days = (Date.now() - last) / (1000 * 60 * 60 * 24);
  if (days < 2) return 0.25;
  if (days < 5) return 0.15;
  if (days < 10) return 0.08;
  return 0;
}

function hasShoes(pick: OutfitPick) {
  return !!pick.shoes;
}

function colorHarmonyScore(colors: string[]) {
  // ✅ very light logic, but works as stylist reasoning
  const c = uniq(colors.map(normalizeColor));
  if (c.length <= 1) return 0.85; // monochrome always safe
  const neutrals = new Set(["black", "white", "grey", "gray", "charcoal", "beige", "cream"]);
  const neutralCount = c.filter((x) => neutrals.has(x)).length;

  if (neutralCount >= 1 && c.length <= 3) return 0.75; // neutral base = safe
  if (c.length >= 4) return 0.35; // too many colors
  return 0.6;
}

export function scoreOutfit(occasion: OccasionProfile, pick: OutfitPick): OutfitScoreResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const breakdown: Record<string, number> = {};

  const items = [pick.top, pick.bottom, pick.shoes, pick.outer, pick.accessory].filter(
    Boolean
  ) as WardrobeItem[];

  if (!items.length) {
    return { score: 0, reasons: [], warnings: ["No items provided"], breakdown: {} };
  }

  // ✅ structure checks (stylist rules)
  if (!pick.top) warnings.push("Missing top item — outfit may look incomplete.");
  if (!pick.bottom) warnings.push("Missing bottom item — outfit may look incomplete.");
  if (!hasShoes(pick)) warnings.push("No shoes selected — add footwear for a complete look.");

  // 1) Occasion/Formality match
  const formalities = items.map(getItemFormality);
  const avgFormality =
    formalities.reduce((a, b) => a + b, 0) / Math.max(1, formalities.length);

  const [minF, maxF] = occasion.formalityRange;

  const formalityFit =
    avgFormality >= minF && avgFormality <= maxF
      ? 1
      : 1 - Math.min(1, Math.abs(avgFormality - occasion.formalityTarget));

  breakdown.formalityFit = clamp01(formalityFit);

  if (breakdown.formalityFit > 0.8)
    reasons.push("Formality level matches the occasion perfectly.");
  else if (breakdown.formalityFit > 0.6)
    reasons.push("Formality is appropriate for this occasion.");
  else if (breakdown.formalityFit < 0.45)
    warnings.push("This outfit might be too casual or too formal for this occasion.");

  // 2) Vibe tag match
  const allTags = uniq(items.flatMap(getItemTags));
  const vibeHit = intersectionScore(allTags, occasion.vibeTags);
  const avoidHit = intersectionScore(allTags, occasion.avoidTags);

  breakdown.vibeMatch = clamp01(vibeHit);
  breakdown.avoidPenalty = clamp01(avoidHit);

  if (vibeHit > 0.35) reasons.push("The overall vibe fits the occasion mood.");
  else if (!allTags.length)
    reasons.push("Clean and simple outfit — safe for most events.");

  if (avoidHit > 0.15) warnings.push("Some pieces may clash with the occasion vibe.");

  // 3) Color preference scoring
  const allColors = uniq(items.flatMap(getItemColors));
  const colorPrefHit = intersectionScore(allColors, occasion.colorPref);
  const avoidColorHit = intersectionScore(allColors, occasion.avoidColors);

  breakdown.colorPref = clamp01(colorPrefHit);
  breakdown.avoidColorsPenalty = clamp01(avoidColorHit);

  // ✅ NEW: color harmony
  const harmony = colorHarmonyScore(allColors);
  breakdown.colorHarmony = clamp01(harmony);

  if (allColors.length) {
    if (breakdown.colorHarmony > 0.75) reasons.push("Color harmony is strong — looks premium.");
    else if (breakdown.colorHarmony < 0.4)
      warnings.push("Too many colors — outfit may look messy. Try neutral base.");
  }

  if (colorPrefHit > 0.25) reasons.push("Colors match the occasion vibe well.");
  if (avoidColorHit > 0.15) warnings.push("Some colors may feel wrong for the occasion.");

  // 4) freshness
  const freshness = items.reduce((acc, it) => acc + freshnessPenalty(it), 0);
  breakdown.freshnessPenalty = clamp01(freshness);

  if (freshness > 0.2)
    warnings.push("Some items were worn recently. Consider a fresher combo.");

  // ✅ 5) completeness bonus
  let completeness = 0;
  if (pick.top) completeness += 0.25;
  if (pick.bottom) completeness += 0.25;
  if (pick.shoes) completeness += 0.22;
  if (pick.outer) completeness += 0.14;
  if (pick.accessory) completeness += 0.14;
  breakdown.completeness = clamp01(completeness);

  if (breakdown.completeness > 0.8) reasons.push("Outfit is complete and looks well put-together.");

  // total score
  const score =
    0.36 * breakdown.formalityFit +
    0.22 * breakdown.vibeMatch +
    0.14 * breakdown.colorPref +
    0.16 * breakdown.colorHarmony +
    0.12 * breakdown.completeness -
    0.16 * breakdown.avoidPenalty -
    0.10 * breakdown.avoidColorsPenalty -
    0.14 * breakdown.freshnessPenalty;

  return {
    score: clamp01(score),
    reasons: uniq(reasons).slice(0, 6),
    warnings: uniq(warnings).slice(0, 6),
    breakdown,
  };
}
