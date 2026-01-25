export function cleanCaptionToDressName(caption) {
  caption = caption.toLowerCase();

  const colors = ["black", "white", "blue", "red", "green", "yellow", "brown", "grey", "gray", "pink", "orange"];
  const clothing = ["jeans", "shirt", "tshirt", "t-shirt", "hoodie", "jacket", "pants", "trousers", "shorts", "skirt", "dress", "sweater"];

  const foundColor = colors.find((c) => caption.includes(c)) || "";
  const foundClothing = clothing.find((c) => caption.includes(c)) || "outfit";

  let finalName = `${foundColor ? foundColor + " " : ""}${foundClothing}`;
  finalName = finalName.replace("t-shirt", "tshirt");

  // capitalize
  finalName = finalName
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return finalName;
}
