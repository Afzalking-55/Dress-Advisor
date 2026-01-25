export function buildSmartName(
  category: "Top" | "Bottom" | "Shoes" | "Other",
  colorName: string,
  caption?: string
): string {
  const text = (caption || "").toLowerCase();

  // extra style words
  let extra = "";

  if (text.includes("printed") || text.includes("pattern")) extra = "Printed";
  else if (text.includes("formal")) extra = "Formal";
  else if (text.includes("oversized")) extra = "Oversized";
  else if (text.includes("baggy")) extra = "Baggy";
  else if (text.includes("denim")) extra = "Denim";

  let base = "Outfit";
  if (category === "Top") base = "Shirt";
  if (category === "Bottom") base = "Jeans";
  if (category === "Shoes") base = "Shoes";

  return `${colorName} ${extra ? extra + " " : ""}${base}`.trim();
}
