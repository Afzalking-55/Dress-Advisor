import { getOutfitsFromHF, WardrobeItem } from "./hfStylist";

export async function generateOutfits(params: {
  occasion?: string;
  mood?: string;
  wardrobe: WardrobeItem[];
  preferences?: any;
}) {
  return getOutfitsFromHF(params);
}
