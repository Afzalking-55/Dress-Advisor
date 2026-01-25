import type { WardrobeItem } from "@/src/ai/types";

export function makeClusterId(item: Partial<WardrobeItem>) {
  const cat = String(item.category || "other").toLowerCase();
  const color = String(item.colorName || "unknown").toLowerCase().replace(/\s+/g, "_");
  const type = String(item.clothType || "outfit").toLowerCase().replace(/\s+/g, "_");

  return `${cat}_${color}_${type}`;
}
