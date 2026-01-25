export function guessStyleTags(label: string): string[] {
  const s = String(label || "").toLowerCase();

  const tags: string[] = [];

  // Casual basics
  if (["tshirt", "t-shirt", "tee", "hoodie", "sneaker"].some((k) => s.includes(k)))
    tags.push("casual", "comfortable");

  // Formal
  if (["blazer", "suit", "shirt", "trouser"].some((k) => s.includes(k)))
    tags.push("formal", "professional");

  // Party
  if (["leather", "black", "jacket"].some((k) => s.includes(k)))
    tags.push("bold", "party");

  // Traditional
  if (["kurta", "sherwani"].some((k) => s.includes(k)))
    tags.push("traditional");

  // Default fallback
  if (!tags.length) tags.push("clean");

  // remove duplicates
  return Array.from(new Set(tags));
}
