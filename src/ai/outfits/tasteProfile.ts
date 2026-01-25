import type { WardrobeItem, OutfitPick } from "./outfitScorer";
import type { OccasionKey } from "./occasionPsychology";

export type TasteProfile = {
  updatedAt: number;

  // preference counts
  colorPrefs: Record<string, number>;
  tagPrefs: Record<string, number>;

  // formality is 0..1
  preferredFormality: number;

  dislikedItems: Record<string, number>;

  occasionPrefs?: Partial<
    Record<
      OccasionKey,
      {
        preferredFormality?: number;
        tagPrefs?: Record<string, number>;
      }
    >
  >;
};

export function emptyTasteProfile(): TasteProfile {
  return {
    updatedAt: Date.now(),
    colorPrefs: {},
    tagPrefs: {},
    preferredFormality: 0.55,
    dislikedItems: {},
    occasionPrefs: {},
  };
}

function normalizeKey(s: string) {
  return String(s || "").trim().toLowerCase();
}

function bump(map: Record<string, number>, key: string, amount = 1) {
  const k = normalizeKey(key);
  if (!k) return;
  map[k] = (map[k] || 0) + amount;
}

function getColors(item?: WardrobeItem) {
  const colors = item?.aiNormalized?.attributes?.colors;
  return Array.isArray(colors) ? colors.map(normalizeKey) : [];
}

function getTags(item?: WardrobeItem) {
  const tags = item?.aiNormalized?.attributes?.styleTags;
  return Array.isArray(tags) ? tags.map(normalizeKey) : [];
}

function getFormality(item?: WardrobeItem) {
  const v = item?.aiNormalized?.attributes?.formality;
  return typeof v === "number" && Number.isFinite(v) ? v : 0.5;
}

export function updateTasteFromRating(params: {
  profile: TasteProfile;
  occasion: OccasionKey;
  pick: OutfitPick;
  rating: number; // 1..5
  wardrobeIndex: Map<string, WardrobeItem>;
}) {
  const { profile, occasion, pick, rating, wardrobeIndex } = params;

  const r = Math.max(1, Math.min(5, Number(rating) || 3));
  // convert rating → weight
  // 5: +3, 4:+2, 3:+0, 2:-1, 1:-2
  const weight = r === 5 ? 3 : r === 4 ? 2 : r === 3 ? 0 : r === 2 ? -1 : -2;

  const items = [
    pick.top?.id,
    pick.bottom?.id,
    pick.shoes?.id,
    pick.outer?.id,
    pick.accessory?.id,
  ]
    .filter(Boolean)
    .map((id) => wardrobeIndex.get(String(id)))
    .filter(Boolean) as WardrobeItem[];

  if (!items.length) return profile;

  // update global prefs
  for (const it of items) {
    const colors = getColors(it);
    const tags = getTags(it);

    for (const c of colors) bump(profile.colorPrefs, c, weight > 0 ? weight : 0);
    for (const t of tags) bump(profile.tagPrefs, t, weight > 0 ? weight : 0);

    // disliked items: if rating low
    if (weight < 0) {
      profile.dislikedItems[it.id] = (profile.dislikedItems[it.id] || 0) + Math.abs(weight);
    }
  }

  // update formality preference
  const avgFormality =
    items.map(getFormality).reduce((a, b) => a + b, 0) / Math.max(1, items.length);

  if (weight > 0) {
    // move preferred formality toward what user liked
    profile.preferredFormality =
      0.85 * profile.preferredFormality + 0.15 * avgFormality;
  }

  // occasion specific prefs
  profile.occasionPrefs = profile.occasionPrefs || {};
  if (!profile.occasionPrefs[occasion]) profile.occasionPrefs[occasion] = {};

  const occ = profile.occasionPrefs[occasion]!;
  if (weight > 0) {
    occ.preferredFormality =
      typeof occ.preferredFormality === "number"
        ? 0.85 * occ.preferredFormality + 0.15 * avgFormality
        : avgFormality;

    // bump tags for this occasion
    occ.tagPrefs = occ.tagPrefs || {};
    for (const it of items) {
      for (const t of getTags(it)) bump(occ.tagPrefs, t, weight);
    }
  }

  profile.updatedAt = Date.now();
  return profile;
}

export function personalizationBoost(params: {
  profile: TasteProfile;
  occasion: OccasionKey;
  pick: OutfitPick;
  wardrobeIndex: Map<string, WardrobeItem>;
}) {
  const { profile, occasion, pick, wardrobeIndex } = params;

  const ids = [
    pick.top?.id,
    pick.bottom?.id,
    pick.shoes?.id,
    pick.outer?.id,
    pick.accessory?.id,
  ]
    .filter(Boolean)
    .map(String);

  const items = ids.map((id) => wardrobeIndex.get(id)).filter(Boolean) as WardrobeItem[];

  if (!items.length) return { boost: 0, reasons: [] as string[], penalties: [] as string[] };

  let boost = 0;
  const reasons: string[] = [];
  const penalties: string[] = [];

  // 1) Disliked items penalty
  for (const id of ids) {
    const dis = profile.dislikedItems[id];
    if (dis && dis > 0) {
      boost -= Math.min(0.25, dis * 0.05);
      penalties.push("Contains an item you previously disliked.");
    }
  }

  // 2) Tag and color preference
  const occPrefs = profile.occasionPrefs?.[occasion];
  for (const it of items) {
    for (const c of getColors(it)) {
      const count = profile.colorPrefs[c] || 0;
      if (count > 2) boost += Math.min(0.08, count * 0.01);
    }

    for (const t of getTags(it)) {
      const globalTag = profile.tagPrefs[t] || 0;
      const occTag = occPrefs?.tagPrefs?.[t] || 0;

      const score = globalTag + 1.5 * occTag;
      if (score > 2) boost += Math.min(0.1, score * 0.01);
    }
  }

  if (boost > 0.07) reasons.push("Matches your style preferences.");

  // 3) Formality preference match
  const avgFormality =
    items.map(getFormality).reduce((a, b) => a + b, 0) / Math.max(1, items.length);

  const targetFormality =
    typeof occPrefs?.preferredFormality === "number"
      ? occPrefs.preferredFormality
      : profile.preferredFormality;

  const diff = Math.abs(avgFormality - targetFormality);

  // smaller diff = better
  if (diff < 0.08) {
    boost += 0.08;
    reasons.push("Matches your preferred formality level.");
  } else if (diff > 0.25) {
    boost -= 0.08;
    penalties.push("Formality may not match your preferences.");
  }

  // clamp boost
  if (boost > 0.25) boost = 0.25;
  if (boost < -0.25) boost = -0.25;

  return { boost, reasons, penalties };
}
