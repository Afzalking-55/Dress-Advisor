export type WardrobeItem = {
  id: string;
  category: "Top" | "Bottom" | "Shoes" | "Other";
  imageUrl: string;
  createdAt: number;
  colorName: string;
  aiName: string;
  occasions?: string[];
  clothType?: string;
};

export type OutfitResult = {
  top?: WardrobeItem;
  bottom?: WardrobeItem;
  shoes?: WardrobeItem;
  score: number;
  reason: string[];
  styleName: string;
};

function titleCase(s: string) {
  return (s || "")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function buildPrompt({
  occasion,
  mood,
  wardrobe,
  preferences,
}: {
  occasion: string;
  mood: string;
  wardrobe: WardrobeItem[];
  preferences?: any;
}) {
  const safeWardrobe = wardrobe.slice(0, 30).map((x) => ({
    id: x.id,
    category: x.category,
    name: x.aiName,
    color: x.colorName,
    type: x.clothType,
    occasions: x.occasions || [],
  }));

  return `
You are DressAI — a premium fashion stylist AI.

TASK:
Pick the BEST 3 outfits from the wardrobe for:
- Occasion: ${occasion}
- Mood: ${mood}

RULES:
- Outfit must include: top, bottom, shoes (if possible)
- Do not repeat same item in multiple outfits
- If missing category, use "Any"
- Give stylish and confident reasoning like a real stylist
- Consider color harmony, occasion formality, and mood vibe
- Consider user preferences if present

USER PREFERENCES:
${JSON.stringify(preferences || {}, null, 2)}

WARDROBE:
${JSON.stringify(safeWardrobe, null, 2)}

OUTPUT STRICT JSON ONLY:
{
  "outfits": [
    {
      "topId": "id or null",
      "bottomId": "id or null",
      "shoesId": "id or null",
      "score": 0-100,
      "reason": ["string", "string", "string"],
      "styleName": "short outfit title"
    }
  ]
}
`;
}

async function callHuggingFace(prompt: string) {
  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN) throw new Error("HF_TOKEN missing in .env.local");

  const res = await fetch(
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    }
  );

  const data = await res.json();

  const outputText =
    Array.isArray(data) ? data?.[0]?.generated_text : data?.generated_text;

  if (!outputText) throw new Error("HF API failed: no output text");

  return outputText;
}

function extractJSON(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("AI did not return JSON");
  const jsonStr = text.slice(start, end + 1);
  return JSON.parse(jsonStr);
}

export async function getOutfitsFromHF(params: {
  occasion?: string;
  mood?: string;
  wardrobe: WardrobeItem[];
  preferences?: any;
}): Promise<{ outfits: OutfitResult[]; raw: any }> {
  const occasion = titleCase(params.occasion || "Casual");
  const mood = titleCase(params.mood || "Confident");
  const wardrobe = params.wardrobe || [];
  const preferences = params.preferences || {};

  if (!wardrobe.length) throw new Error("Wardrobe empty");

  const prompt = buildPrompt({ occasion, mood, wardrobe, preferences });
  const aiText = await callHuggingFace(prompt);
  const parsed = extractJSON(aiText);

  const byId = new Map(wardrobe.map((x) => [x.id, x]));
  const outfits = (parsed.outfits || []).slice(0, 3).map((o: any) => {
    const top = o.topId ? byId.get(o.topId) : undefined;
    const bottom = o.bottomId ? byId.get(o.bottomId) : undefined;
    const shoes = o.shoesId ? byId.get(o.shoesId) : undefined;

    return {
      top,
      bottom,
      shoes,
      score: Math.min(100, Math.max(0, Number(o.score || 65))),
      reason: Array.isArray(o.reason) ? o.reason.slice(0, 6) : [],
      styleName: o.styleName || "Outfit Pick",
    };
  });

  return { outfits, raw: parsed };
}
