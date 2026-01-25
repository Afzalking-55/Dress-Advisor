import { updateWardrobeItem } from "../data/firestoreAI";

/**
 * Mark one wardrobe item as the representative for a cluster.
 * - Old representative (if exists) => isRepresentative false
 * - New representative => isRepresentative true + clusterId set
 */
export async function markRepresentative(params: {
  uid: string;
  clusterId: string;
  newRepItemId: string;
  oldRepItemId?: string;
}) {
  const { uid, clusterId, newRepItemId, oldRepItemId } = params;

  // Remove old representative flag
  if (oldRepItemId) {
    await updateWardrobeItem(uid, oldRepItemId, {
      isRepresentative: false,
    });
  }

  // Set new representative
  await updateWardrobeItem(uid, newRepItemId, {
    clusterId,
    isRepresentative: true,
  });
}
