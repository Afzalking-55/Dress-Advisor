import { getWardrobeItem, updateWardrobeItem } from "../data/firestoreAI";
import { AI_VERSION } from "../versioning/aiVersion";

/**
 * Deterministic analysis persistence:
 * - If analysis already exists in Firestore and imageUrl unchanged => return cached result
 * - Else compute analysis once, store it, return it
 */
export async function analyzeClothingIfNeeded(params: {
  uid: string;
  itemId: string;
  imageUrl: string;
}) {
  const { uid, itemId, imageUrl } = params;

  // 1) Fetch wardrobe item
  const item = await getWardrobeItem(uid, itemId);
  if (!item) throw new Error("Wardrobe item not found");

  // 2) If already analyzed AND same image => reuse (deterministic)
  if (item.analysis && item.analysisConfidence && item.imageUrl === imageUrl) {
    return {
      analysis: item.analysis,
      analysisConfidence: item.analysisConfidence,
      cached: true,
    };
  }

  // 3) Compute analysis (TEMP baseline)
  // Later we replace this with your real AI vision analyze system
  const analysis = {
    style: "casual" as const,
    occasions: item.occasions?.length ? item.occasions : ["casual"],
    pattern: "solid",
  };

  const analysisConfidence = 0.8;

  // 4) Save analysis (deterministic: store once)
  await updateWardrobeItem(uid, itemId, {
    imageUrl,
    analysis,
    analysisConfidence,
    aiVersion: AI_VERSION,
  });

  return {
    analysis,
    analysisConfidence,
    cached: false,
  };
}
