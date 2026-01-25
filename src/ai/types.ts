export type WardrobeItem = {
  id: string;
  category: "Top" | "Bottom" | "Shoes" | "Other";
  imageUrl: string;
  createdAt: number;
  colorName: string;
  aiName: string;
  occasions?: string[];
  clothType?: string;

  analysis?: {
    style?: "casual" | "formal" | "sport";
    occasions?: string[];
    pattern?: string;
  };

  analysisConfidence?: number;

  embedding?: number[];
  clusterId?: string;
  isRepresentative?: boolean;

  aiVersion?: string;
};

export type WardrobeCluster = {
  clusterId: string;
  type: "top" | "bottom" | "shoes" | "accessory";
  representativeItemId: string;
  memberItemIds: string[];
  confidence: number;
  createdAt: number;
  updatedAt: number;
};

export type AIDecisionLog = {
  occasion: string;
  mood: string;
  included: Record<string, string>;
  excluded: Record<string, string>;
  rulesTriggered: string[];
  scores: Record<string, number>;
  outfits: Array<{
    topId?: string | null;
    bottomId?: string | null;
    shoesId?: string | null;
    score: number;
  }>;
  aiVersion: string;
  createdAt: number;
};
