// app/lib/skinTone.ts
// ✅ Skin Tone Advisor — 10 levels + undertones (Premium Feature)

export type Undertone = "Warm" | "Cool" | "Neutral";

export type SkinToneProfile = {
  level: number; // 1..10
  label: string;
  undertone: Undertone;

  bestColors: string[];
  avoidColors: string[];
  bestNeutrals: string[];
  metals: string[];

  palettes: { name: string; colors: string[] }[];
};

export const SKIN_TONE_LABELS: { level: number; label: string }[] = [
  { level: 1, label: "Deep Espresso" },
  { level: 2, label: "Rich Cocoa" },
  { level: 3, label: "Warm Mahogany" },
  { level: 4, label: "Golden Brown" },
  { level: 5, label: "Honey Tan" },
  { level: 6, label: "Warm Beige" },
  { level: 7, label: "Soft Sand" },
  { level: 8, label: "Light Peach" },
  { level: 9, label: "Porcelain Warm" },
  { level: 10, label: "Porcelain Cool" },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

/**
 * ✅ Main skin tone engine
 * Returns profile: best colors, avoid colors, metals, palette suggestions
 */
export function getSkinToneProfile(
  level: number,
  undertone: Undertone
): SkinToneProfile {
  const lv = clamp(Math.round(level), 1, 10);
  const label =
    SKIN_TONE_LABELS.find((x) => x.level === lv)?.label || `Tone ${lv}`;

  let bestColors: string[] = [];
  let avoidColors: string[] = [];
  let bestNeutrals: string[] = [];
  let metals: string[] = [];
  let palettes: { name: string; colors: string[] }[] = [];

  // ---------------- Tone buckets ----------------
  if (lv <= 2) {
    bestColors = [
      "White",
      "Cream",
      "Camel",
      "Emerald",
      "Cobalt Blue",
      "Maroon",
      "Mustard",
      "Teal",
      "Bright Red",
      "Lavender",
    ];
    avoidColors = ["Muddy Brown", "Dark Grey (low contrast)", "Dusty Beige"];
    bestNeutrals = ["White", "Cream", "Camel", "Charcoal"];
    metals = ["Gold", "Rose Gold"];
    palettes = [
      { name: "Luxury Contrast", colors: ["White", "Camel", "Gold"] },
      { name: "Bold Royal", colors: ["Cobalt Blue", "White", "Black"] },
      { name: "Festive Rich", colors: ["Maroon", "Cream", "Gold"] },
    ];
  } else if (lv <= 4) {
    bestColors = [
      "Ivory",
      "Navy",
      "Emerald",
      "Olive",
      "Burgundy",
      "Purple",
      "Mustard",
      "Coral",
      "Teal",
      "Bright Blue",
    ];
    avoidColors = ["Dull Grey", "Overly Pale Yellow"];
    bestNeutrals = ["Ivory", "Navy", "Charcoal", "Beige"];
    metals = ["Gold", "Bronze"];
    palettes = [
      { name: "Smart Formal", colors: ["Navy", "Ivory", "Brown"] },
      { name: "Street Premium", colors: ["Black", "Olive", "White"] },
      { name: "Pop Color", colors: ["Coral", "Beige", "White"] },
    ];
  } else if (lv <= 6) {
    bestColors = [
      "White",
      "Black",
      "Navy",
      "Olive",
      "Burgundy",
      "Forest Green",
      "Peach",
      "Sky Blue",
      "Cream",
      "Chocolate Brown",
    ];
    avoidColors = ["Neon Yellow-Green", "Too much Beige (blends)"];
    bestNeutrals = ["White", "Black", "Navy", "Camel"];
    metals = ["Gold", "Silver"];
    palettes = [
      { name: "Old Money", colors: ["Cream", "Camel", "Brown"] },
      { name: "Clean Classic", colors: ["White", "Navy", "Tan"] },
      { name: "Bold Minimal", colors: ["Black", "White", "Burgundy"] },
    ];
  } else {
    bestColors = [
      "Navy",
      "Charcoal",
      "Forest Green",
      "Burgundy",
      "Teal",
      "Lavender",
      "Blush Pink",
      "Emerald",
      "Cobalt Blue",
      "Tan",
    ];
    avoidColors = ["Too much White (washout)", "Very Pale Grey + Beige"];
    bestNeutrals = ["Navy", "Charcoal", "Taupe", "Brown"];
    metals = ["Silver", "White Gold"];
    palettes = [
      { name: "Cool Elegant", colors: ["Charcoal", "Navy", "Silver"] },
      { name: "Soft Premium", colors: ["Blush Pink", "Taupe", "White"] },
      { name: "High Contrast", colors: ["Black", "White", "Navy"] },
    ];
  }

  // ---------------- Undertone adjustment ----------------
  if (undertone === "Warm") {
    bestColors = uniq([...bestColors, "Rust", "Olive", "Mustard"]).slice(0, 10);
    avoidColors = uniq([...avoidColors, "Icy Blue", "Cold Silver Grey"]);
    metals = ["Gold", "Bronze", "Rose Gold"];
  } else if (undertone === "Cool") {
    bestColors = uniq([...bestColors, "Royal Blue", "Cool Grey", "Emerald"]).slice(
      0,
      10
    );
    avoidColors = uniq([...avoidColors, "Warm Orange", "Rust"]);
    metals = ["Silver", "White Gold"];
  } else {
    metals = ["Gold", "Silver"];
  }

  return {
    level: lv,
    label,
    undertone,
    bestColors: uniq(bestColors),
    avoidColors: uniq(avoidColors),
    bestNeutrals: uniq(bestNeutrals),
    metals: uniq(metals),
    palettes,
  };
}

// ---------------- OutfitBrain helpers ----------------

export function normalizeColorName(s?: string) {
  return (s || "").trim().toLowerCase();
}

export function isColorRecommended(profile: SkinToneProfile, itemColor?: string) {
  const c = normalizeColorName(itemColor);
  if (!c) return false;

  return profile.bestColors.some((x) => {
    const k = normalizeColorName(x);
    return k && (c.includes(k) || k.includes(c));
  });
}

export function isColorAvoid(profile: SkinToneProfile, itemColor?: string) {
  const c = normalizeColorName(itemColor);
  if (!c) return false;

  return profile.avoidColors.some((x) => {
    const k = normalizeColorName(x);
    return k && (c.includes(k) || k.includes(c));
  });
}
