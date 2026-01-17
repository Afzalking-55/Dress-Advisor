// app/lib/outfitBrain.ts
// ✅ DressAI Outfit Brain v3 (Premium + Stable + SkinTone AI)

export type WardrobeCategory = "Top" | "Bottom" | "Shoes" | "Other";

export type WardrobeItem = {
  id: string;
  category: WardrobeCategory;
  imageUrl: string;
  createdAt: number;

  colorName?: string;
  aiName?: string;

  occasions?: string[];
  clothType?: string;
};

export type UserPrefs = {
  style?: string;
  strictness?: "Relaxed" | "Normal" | "Strict";
  favColors?: string[];
  avoidColors?: string[];
};

export type OutfitHistoryPick = {
  pickedAt: number;
  occasion: string;
  mood: string;
  outfit: {
    top?: WardrobeItem;
    bottom?: WardrobeItem;
    shoes?: WardrobeItem;
    score: number;
    reason: string[];
  };
};

export type Outfit = {
  top?: WardrobeItem;
  bottom?: WardrobeItem;
  shoes?: WardrobeItem;
  score: number;
  reason: string[];
};

/* ----------------------- utils ----------------------- */

function normalize(s: string) {
  return (s || "").trim().toLowerCase();
}

function titleCase(s: string) {
  return (s || "")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function safeText(s?: string) {
  return (s || "").trim();
}

function safeArray<T>(arr: any): T[] {
  return Array.isArray(arr) ? arr : [];
}

function displayName(item?: WardrobeItem) {
  if (!item) return "Any";
  return (
    safeText(item.aiName) ||
    safeText(item.clothType) ||
    safeText(item.colorName) ||
    item.category
  );
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (!arr || arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniqueKey(
  top?: WardrobeItem,
  bottom?: WardrobeItem,
  shoes?: WardrobeItem
) {
  return `${top?.id || "x"}-${bottom?.id || "x"}-${shoes?.id || "x"}`;
}

/* -------------------- ✅ Skin Tone Profile -------------------- */

type SkinToneLevel =
  | "Deep"
  | "Dark"
  | "Medium Dark"
  | "Medium"
  | "Light Medium"
  | "Light"
  | "Very Light";

type Undertone = "Warm" | "Cool" | "Neutral" | "Unknown";

type SkinToneData = {
  skinTone?: SkinToneLevel;
  undertone?: Undertone;
};

function getSkinToneFromLocalStorage(): SkinToneData {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("skinToneData");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed || {};
  } catch {
    return {};
  }
}

/* ------------------- fashion intelligence ------------------- */

type ColorGroup =
  | "neutral"
  | "blue"
  | "red"
  | "green"
  | "purple"
  | "orange"
  | "other";

function colorGroup(colorName?: string): ColorGroup {
  const c = normalize(colorName || "");

  if (!c) return "other";

  if (
    c.includes("black") ||
    c.includes("white") ||
    c.includes("grey") ||
    c.includes("gray") ||
    c.includes("charcoal") ||
    c.includes("beige") ||
    c.includes("brown") ||
    c.includes("cream")
  )
    return "neutral";

  if (c.includes("blue") || c.includes("navy")) return "blue";
  if (c.includes("red") || c.includes("maroon")) return "red";
  if (c.includes("green") || c.includes("olive")) return "green";
  if (c.includes("purple") || c.includes("violet")) return "purple";
  if (c.includes("orange") || c.includes("yellow") || c.includes("mustard"))
    return "orange";

  return "other";
}

function occasionFormality(occasion: string) {
  const o = normalize(occasion);

  if (o.includes("wedding") || o.includes("festive") || o.includes("function"))
    return 5;
  if (o.includes("interview")) return 5;
  if (o.includes("office") || o.includes("meeting")) return 4;
  if (o.includes("date") || o.includes("dinner") || o.includes("night"))
    return 3;
  if (o.includes("party") || o.includes("movie") || o.includes("shopping"))
    return 3;
  if (o.includes("college") || o.includes("travel")) return 2;
  if (o.includes("gym") || o.includes("sports") || o.includes("beach"))
    return 1;
  if (o.includes("casual")) return 1;

  return 2;
}

function clothFormality(item?: WardrobeItem) {
  if (!item) return 2;

  const t = normalize(item.clothType || item.aiName || "");

  if (t.includes("blazer") || t.includes("coat")) return 5;
  if (t.includes("shirt") || t.includes("polo") || t.includes("formal"))
    return 4;
  if (t.includes("jacket") || t.includes("sweater")) return 3;
  if (t.includes("hoodie") || t.includes("t-shirt") || t.includes("tshirt"))
    return 2;

  return 2;
}

// 0..20
function colorMatchScore(top?: WardrobeItem, bottom?: WardrobeItem) {
  if (!top || !bottom) return 12;

  const tg = colorGroup(top.colorName);
  const bg = colorGroup(bottom.colorName);

  if (tg === "neutral" || bg === "neutral") return 20;
  if (tg === bg) return 17;

  const goodPairs: [ColorGroup, ColorGroup][] = [
    ["blue", "red"],
    ["blue", "green"],
    ["red", "purple"],
    ["green", "purple"],
    ["orange", "blue"],
  ];

  if (
    goodPairs.some(([a, b]) => (tg === a && bg === b) || (tg === b && bg === a))
  )
    return 14;

  return 8;
}

// 0..20
function itemOccasionScore(item: WardrobeItem, occ: string) {
  const tags = safeArray<string>(item.occasions).map(normalize);
  if (!tags.length) return 11;

  const o = normalize(occ);
  if (tags.some((x) => o.includes(x) || x.includes(o))) return 20;

  if (
    o.includes("office") &&
    tags.some((x) => x.includes("meeting") || x.includes("work"))
  )
    return 15;

  return 7;
}

// 0..18
function moodBoost(mood: string, item?: WardrobeItem) {
  if (!item) return 0;

  const m = normalize(mood);
  const t = normalize(item.clothType || item.aiName || "");
  const cg = colorGroup(item.colorName);

  let s = 0;

  if (m.includes("street")) {
    if (t.includes("hoodie") || t.includes("sneakers") || t.includes("jacket"))
      s += 8;
    if (cg === "neutral" || cg === "blue") s += 4;
  }

  if (
    m.includes("serious") ||
    m.includes("formal") ||
    m.includes("clean") ||
    m.includes("minimal")
  ) {
    if (t.includes("shirt") || t.includes("polo") || t.includes("blazer"))
      s += 10;
    if (cg === "neutral" || cg === "blue") s += 3;
  }

  if (m.includes("cute")) {
    if (cg === "purple" || cg === "orange") s += 8;
  }

  if (
    m.includes("bold") ||
    m.includes("confident") ||
    m.includes("sexy") ||
    m.includes("rich")
  ) {
    if (cg === "red" || cg === "neutral" || cg === "purple") s += 12;
  }

  return s;
}

/* -------------------- ✅ Skin tone scoring -------------------- */

// 0..18 boost/penalty
function skinToneColorScore(colorName: string | undefined, profile: SkinToneData) {
  const c = normalize(colorName || "");
  if (!c) return 0;

  const tone = profile.skinTone || "";
  const u = profile.undertone || "Unknown";

  const grp = colorGroup(colorName);

  let score = 0;

  // Universal safe colors
  if (grp === "neutral" || c.includes("navy")) score += 6;

  // Deep/Dark skin: high contrast & jewel tones pop
  if (tone === "Deep" || tone === "Dark") {
    if (c.includes("white") || c.includes("cream")) score += 8;
    if (grp === "red" || grp === "purple" || c.includes("emerald")) score += 6;
    if (c.includes("brown") && !c.includes("camel")) score -= 2;
  }

  // Medium skin: balanced tones
  if (tone === "Medium Dark" || tone === "Medium") {
    if (grp === "blue" || grp === "green") score += 5;
    if (c.includes("mustard") || c.includes("olive")) score += 4;
  }

  // Light skins: avoid too-washy shades
  if (tone === "Light Medium" || tone === "Light" || tone === "Very Light") {
    if (c.includes("beige") || c.includes("cream")) score -= 2; // can wash out
    if (grp === "red" || grp === "blue") score += 5;
    if (c.includes("black")) score += 3; // contrast helps
  }

  // Undertone rules
  if (u === "Warm") {
    if (c.includes("olive") || c.includes("mustard") || c.includes("beige") || c.includes("brown"))
      score += 6;
    if (c.includes("icy") || c.includes("silver")) score -= 3;
  }

  if (u === "Cool") {
    if (grp === "blue" || c.includes("navy") || c.includes("grey") || c.includes("gray"))
      score += 6;
    if (c.includes("orange") || c.includes("mustard")) score -= 3;
  }

  if (u === "Neutral") {
    score += 2;
  }

  return Math.max(-10, Math.min(18, score));
}

function skinToneOutfitBoost(
  profile: SkinToneData,
  top?: WardrobeItem,
  bottom?: WardrobeItem
) {
  if (!profile?.skinTone && !profile?.undertone) return { boost: 0, reason: "" };

  const topBoost = skinToneColorScore(top?.colorName, profile);
  const bottomBoost = skinToneColorScore(bottom?.colorName, profile);

  const total = Math.round((topBoost + bottomBoost) / 2);

  let reason = "";
  if (total >= 10) reason = "✨ Skin tone glow match: colors enhance your complexion.";
  else if (total >= 5) reason = "✨ Good skin tone match: balanced palette works well.";
  else if (total <= -5) reason = "⚠️ Skin tone mismatch: colors may look dull on you.";
  else reason = "✨ Neutral skin tone match: safe wearable palette.";

  return { boost: total, reason };
}

/* ----------------------- learning profile ----------------------- */

function buildLearningProfile(history: OutfitHistoryPick[]) {
  const likes: Record<string, number> = {};
  const colorLikes: Record<string, number> = {};
  const typeLikes: Record<string, number> = {};

  for (const h of history || []) {
    const items = [h?.outfit?.top, h?.outfit?.bottom, h?.outfit?.shoes].filter(
      Boolean
    ) as WardrobeItem[];

    for (const item of items) {
      const name = normalize(item.aiName || item.clothType || item.category);
      likes[name] = (likes[name] || 0) + 1;

      const c = normalize(item.colorName || "");
      if (c) colorLikes[c] = (colorLikes[c] || 0) + 1;

      const t = normalize(item.clothType || "");
      if (t) typeLikes[t] = (typeLikes[t] || 0) + 1;
    }
  }

  return { likes, colorLikes, typeLikes };
}

/* ------------------- premium reasons ------------------- */

function stylistReasons(params: {
  occasion: string;
  mood: string;
  top?: WardrobeItem;
  bottom?: WardrobeItem;
  shoes?: WardrobeItem;
  formalityFit: number;
  colorScore: number;
  moodScore: number;
  skinToneReason?: string;
}) {
  const {
    occasion,
    mood,
    top,
    bottom,
    shoes,
    formalityFit,
    colorScore,
    moodScore,
    skinToneReason,
  } = params;

  const reasons: string[] = [];

  reasons.push(
    `📌 Occasion: ${titleCase(occasion)}${mood ? ` • Mood: ${titleCase(mood)}` : ""}`
  );

  // skin tone reason (big premium feel)
  if (skinToneReason) reasons.push(skinToneReason);

  // color
  const tg = colorGroup(top?.colorName);
  const bg = colorGroup(bottom?.colorName);
  if (tg === "neutral" || bg === "neutral") {
    reasons.push("🎨 Neutral balance keeps the fit clean and premium.");
  } else if (tg === bg) {
    reasons.push("🎨 Same-color family creates a strong, matched silhouette.");
  } else if (colorScore >= 14) {
    reasons.push("🎨 Complementary colors = stylish contrast without looking loud.");
  } else {
    reasons.push("🎨 Slight contrast gives a casual everyday vibe.");
  }

  // formality
  if (formalityFit >= 15) reasons.push("👔 Formality matches the occasion perfectly.");
  else if (formalityFit >= 10)
    reasons.push("👔 Formality is decent — looks smart without overdoing it.");
  else reasons.push("👔 This is more relaxed; great if you want comfort-first.");

  // mood
  if (moodScore >= 20) reasons.push("🧠 This fit strongly matches your mood vibe.");
  else if (moodScore >= 12) reasons.push("🧠 Mood match is good — confident and wearable.");
  else reasons.push("🧠 Neutral mood: easy to wear and safe.");

  reasons.push(
    `Top: ${displayName(top)} • Bottom: ${displayName(bottom)} • Shoes: ${displayName(shoes)}`
  );

  return reasons;
}

/* --------------------------- main AI --------------------------- */

export function generateAIOutfits(params: {
  occasion: string;
  mood: string;
  wardrobe: WardrobeItem[];
  prefs?: UserPrefs;
  history?: OutfitHistoryPick[];
}) {
  const { occasion, mood, wardrobe, prefs, history } = params;

  const skinProfile = getSkinToneFromLocalStorage();

  const tops = wardrobe.filter((i) => i.category === "Top");
  const bottoms = wardrobe.filter((i) => i.category === "Bottom");
  const shoes = wardrobe.filter((i) => i.category === "Shoes");

  const profile = buildLearningProfile(history || []);
  const need = occasionFormality(occasion);

  const tList: (WardrobeItem | undefined)[] = tops.length ? tops : [undefined];
  const bList: (WardrobeItem | undefined)[] = bottoms.length ? bottoms : [undefined];
  const sList: (WardrobeItem | undefined)[] = shoes.length ? shoes : [undefined];

  const TOP_LIMIT = 18;
  const BOTTOM_LIMIT = 18;
  const SHOE_LIMIT = 12;

  const tt = shuffle(tList).slice(0, TOP_LIMIT);
  const bb = shuffle(bList).slice(0, BOTTOM_LIMIT);
  const ss = shuffle(sList).slice(0, SHOE_LIMIT);

  const combos: Outfit[] = [];
  const seen = new Set<string>();

  for (const t of tt) {
    for (const b of bb) {
      for (const s of ss) {
        const key = uniqueKey(t, b, s);
        if (seen.has(key)) continue;
        seen.add(key);

        let score = 0;

        // Occasion
        if (t) score += itemOccasionScore(t, occasion);
        if (b) score += itemOccasionScore(b, occasion);
        if (s) score += itemOccasionScore(s, occasion);

        // Color
        const cScore = colorMatchScore(t, b);
        score += cScore;

        // Formality
        const outfitFormality =
          Math.round((clothFormality(t) + clothFormality(b) + clothFormality(s)) / 3) || 2;
        const diff = Math.abs(outfitFormality - need);
        const formalScore = Math.max(0, 18 - diff * 4);
        score += formalScore;

        // Mood
        const moodScore = moodBoost(mood, t) + moodBoost(mood, b) + moodBoost(mood, s);
        score += moodScore;

        // ✅ Skin tone boost
        const skin = skinToneOutfitBoost(skinProfile, t, b);
        score += skin.boost;

        // Prefs
        if (prefs?.favColors?.length) {
          const fav = prefs.favColors.map(normalize);
          if (t && fav.includes(normalize(t.colorName || ""))) score += 7;
          if (b && fav.includes(normalize(b.colorName || ""))) score += 5;
        }

        if (prefs?.avoidColors?.length) {
          const bad = prefs.avoidColors.map(normalize);
          if (t && bad.includes(normalize(t.colorName || ""))) score -= 10;
          if (b && bad.includes(normalize(b.colorName || ""))) score -= 8;
        }

        // strict office mode
        if (
          normalize(occasion).includes("office") &&
          prefs?.strictness === "Strict"
        ) {
          const topType = normalize(t?.clothType || t?.aiName || "");
          if (
            topType.includes("hoodie") ||
            topType.includes("t-shirt") ||
            topType.includes("tshirt")
          ) {
            score -= 15;
          }
        }

        // Learning boost
        const learnBoost = [t, b, s]
          .filter(Boolean)
          .reduce((acc, item) => {
            const ii = item as WardrobeItem;
            const nameKey = normalize(ii.aiName || ii.clothType || ii.category);
            const colorKey = normalize(ii.colorName || "");
            const typeKey = normalize(ii.clothType || "");
            return (
              acc +
              (profile.likes[nameKey] || 0) * 3 +
              (profile.colorLikes[colorKey] || 0) * 2 +
              (profile.typeLikes[typeKey] || 0) * 2
            );
          }, 0);

        score += learnBoost;

        // clamp 0..100
        score = Math.round(Math.max(0, Math.min(100, score)));

        const reasons = stylistReasons({
          occasion,
          mood,
          top: t,
          bottom: b,
          shoes: s,
          formalityFit: formalScore,
          colorScore: cScore,
          moodScore,
          skinToneReason: skin.reason,
        });

        combos.push({
          top: t,
          bottom: b,
          shoes: s,
          score,
          reason: reasons,
        });
      }
    }
  }

  // padding fallback (unique only)
  while (combos.length < 6) {
    const t = pickRandom(tops);
    const b = pickRandom(bottoms);
    const s = pickRandom(shoes);

    const key = uniqueKey(t, b, s);
    if (seen.has(key)) continue;
    seen.add(key);

    combos.push({
      top: t,
      bottom: b,
      shoes: s,
      score: 55,
      reason: [
        `📌 Occasion: ${titleCase(occasion)}${mood ? ` • Mood: ${titleCase(mood)}` : ""}`,
        "✨ Clean everyday recommendation based on your wardrobe.",
        `Top: ${displayName(t)} • Bottom: ${displayName(b)} • Shoes: ${displayName(s)}`,
      ],
    });
  }

  combos.sort((a, b) => b.score - a.score);

  return combos.slice(0, 3);
}
