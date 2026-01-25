export type Category = "top" | "bottom" | "shoes" | "outer" | "accessory" | "unknown";

const TOP = ["shirt", "tshirt", "t-shirt", "tee", "polo", "kurta", "sweater", "top"];
const BOTTOM = ["jeans", "pants", "trouser", "shorts", "bottom"];
const SHOES = ["shoe", "shoes", "sneaker", "slipper", "loafer", "boot", "footwear"];
const OUTER = ["jacket", "hoodie", "coat", "blazer", "outer"];
const ACCESSORY = ["watch", "belt", "cap", "hat", "bag", "sunglass", "accessory"];

export function mapLabelToCategory(label: string): Category {
  const s = String(label || "").toLowerCase();

  if (TOP.some((k) => s.includes(k))) return "top";
  if (BOTTOM.some((k) => s.includes(k))) return "bottom";
  if (SHOES.some((k) => s.includes(k))) return "shoes";
  if (OUTER.some((k) => s.includes(k))) return "outer";
  if (ACCESSORY.some((k) => s.includes(k))) return "accessory";

  return "unknown";
}
