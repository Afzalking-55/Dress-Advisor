import type { WardrobeItem } from "./outfitScorer";

export function mapLabelToCategory(label: string): string {
  const l = String(label || "").toLowerCase();

  // SHOES
  if (
    l.includes("shoe") ||
    l.includes("sneaker") ||
    l.includes("boot") ||
    l.includes("loafer") ||
    l.includes("heel") ||
    l.includes("sandal") ||
    l.includes("slipper") ||
    l.includes("footwear")
  )
    return "shoes";

  // BOTTOM
  if (
    l.includes("pant") ||
    l.includes("jean") ||
    l.includes("trouser") ||
    l.includes("short") ||
    l.includes("skirt") ||
    l.includes("legging") ||
    l.includes("cargo") ||
    l.includes("bottom")
  )
    return "bottom";

  // TOP
  if (
    l.includes("shirt") ||
    l.includes("t-shirt") ||
    l.includes("tshirt") ||
    l.includes("hoodie") ||
    l.includes("jacket") ||
    l.includes("coat") ||
    l.includes("sweater") ||
    l.includes("kurta") ||
    l.includes("top")
  )
    return "top";

  // OUTER
  if (
    l.includes("jacket") ||
    l.includes("coat") ||
    l.includes("blazer") ||
    l.includes("outerwear")
  )
    return "outer";

  return "other";
}

/**
 * ✅ Fix wardrobe items that are missing aiNormalized.attributes.category
 */
export function normalizeWardrobeCategory(item: WardrobeItem): WardrobeItem {
  const label =
    item?.aiNormalized?.topLabel ||
    item?.clothType ||
    item?.aiNormalized?.attributes?.category ||
    "outfit";

  const cat = mapLabelToCategory(label);

  if (!item.aiNormalized) item.aiNormalized = {};
  if (!item.aiNormalized.attributes) item.aiNormalized.attributes = {};

  item.aiNormalized.attributes.category = cat;

  return item;
}
