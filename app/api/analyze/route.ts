import { NextResponse } from "next/server";

function rgbToColorName(r: number, g: number, b: number) {
  if (r < 60 && g < 60 && b < 60) return "Black";
  if (r > 210 && g > 210 && b > 210) return "White";

  const rg = Math.abs(r - g);
  const gb = Math.abs(g - b);
  const rb = Math.abs(r - b);

  if (rg < 18 && gb < 18 && rb < 18) {
    if (r > 185) return "Light Grey";
    if (r > 130) return "Grey";
    if (r > 90) return "Dark Grey";
    return "Charcoal";
  }

  if (b > r && b > g) return "Blue";
  if (r > g && r > b) return "Red";
  if (g > r && g > b) return "Green";

  if (r > 160 && g > 120 && b < 90) return "Brown";
  if (r > 200 && g > 180 && b < 140) return "Beige";

  return "Dark";
}

function suggestOccasions(category: string, color: string, caption: string) {
  const text = (caption || "").toLowerCase();
  const res: string[] = [];

  // ✅ office rules
  const isFormal =
    text.includes("formal") ||
    text.includes("shirt") ||
    text.includes("blazer") ||
    text.includes("suit");

  // ✅ casual rules
  const isCasual =
    text.includes("t-shirt") ||
    text.includes("tshirt") ||
    text.includes("hoodie") ||
    text.includes("jeans") ||
    text.includes("casual") ||
    text.includes("printed") ||
    text.includes("pattern");

  if (isFormal && color !== "Red" && color !== "Pink") res.push("Office");
  if (isCasual) res.push("College", "Casual");

  if (res.length === 0) res.push("Casual");

  // remove duplicates
  return [...new Set(res)];
}

function psychologyText(color: string) {
  if (color === "Black") return "Black gives powerful & confident vibes.";
  if (color === "Blue") return "Blue shows calm & trustworthy personality.";
  if (color === "Grey" || color.includes("Grey")) return "Grey gives balanced and mature vibe.";
  if (color === "White") return "White shows clean and confident energy.";
  if (color === "Red") return "Red gives bold and attention-grabbing vibe.";
  return "This outfit reflects a stylish personality.";
}

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert base64 -> buffer
    const base64Data = imageBase64.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    // ✅ Caption model
    const HF_MODEL = "nlpconnect/vit-gpt2-image-captioning";

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/octet-stream",
        },
        body: buffer,
      }
    );

    const result = await response.json();
    if (!response.ok) return NextResponse.json({ error: result }, { status: 500 });

    const caption = result?.[0]?.generated_text || "clothing";

    // ✅ Fake rgb should never return: generate stable colorName instead
    // If you already detect rgb in frontend, send it here later. For now, we return just caption.
    return NextResponse.json({ caption });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Analyze failed", details: err.message },
      { status: 500 }
    );
  }
}
