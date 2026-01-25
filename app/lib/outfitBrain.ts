/* ======================================================
   DressAI Frontend → Backend Connector
   FULL FINAL VERSION
====================================================== */

export type WardrobeItem = {
  id: string;
  category: "Top" | "Bottom" | "Shoes" | "Other";
  imageUrl: string;
  aiName?: string;
  colorName?: string;
};

export type Outfit = {
  top?: WardrobeItem;
  bottom?: WardrobeItem;
  shoes?: WardrobeItem;
  score: number;
  reason: string[];
};

/* ======================================================
   MAIN AI CALL
====================================================== */

export async function generateAIOutfits({
  occasion,
  mood,
  wardrobe,
  userId = "local",
}: {
  occasion: string;
  mood: string;
  wardrobe: WardrobeItem[];
  userId?: string;
}): Promise<Outfit[]> {

  // ---------------------------
  // Split wardrobe for backend
  // ---------------------------
  const tops = wardrobe.filter((w) => w.category === "Top");
  const bottoms = wardrobe.filter((w) => w.category === "Bottom");

  if (!tops.length || !bottoms.length) {
    console.warn("DressAI: Missing tops or bottoms");
    return [];
  }

  try {
    const res = await fetch("http://127.0.0.1:8001/style-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        message: `${occasion} ${mood}`,
        tops,
        bottoms,
      }),
    });

    const data = await res.json();

    if (data.status !== "success") {
      console.error("DressAI backend error:", data);
      return [];
    }

    return data.ranked_outfits || [];
  } catch (err) {
    console.error("DressAI fetch failed:", err);
    return [];
  }
}
